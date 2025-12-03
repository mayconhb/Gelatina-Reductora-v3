import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('Supabase client initialized successfully');
} else {
  console.warn('Warning: Supabase credentials not configured. Running in demo mode - all products will appear as locked.');
}

export { supabase };

export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

// =============================================
// INTERFACES
// =============================================

export interface Purchase {
  id?: number;
  user_email: string;
  product_id: string;
  hotmart_product_id: string;
  hotmart_transaction_id: string;
  status: 'active' | 'refunded' | 'cancelled';
  purchased_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id?: number;
  email: string;
  name: string;
  avatar: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProtocolProgress {
  id?: number;
  user_email: string;
  product_id: string;
  completed_days: number[];
  created_at?: string;
  updated_at?: string;
}

export interface WeightEntry {
  id?: number;
  user_email: string;
  weight: number;
  recorded_at: string;
  created_at?: string;
}

// =============================================
// PURCHASES FUNCTIONS
// =============================================

export async function getUserPurchases(email: string): Promise<Purchase[]> {
  if (!supabase) {
    console.warn('Supabase not configured - returning empty purchases');
    return [];
  }

  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_email', email.toLowerCase())
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }

  return data || [];
}

export async function addPurchase(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot add purchase');
    return false;
  }

  const { error } = await supabase
    .from('purchases')
    .upsert({
      ...purchase,
      user_email: purchase.user_email.toLowerCase(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'hotmart_transaction_id'
    });

  if (error) {
    console.error('Error adding purchase:', error);
    return false;
  }

  return true;
}

export async function updatePurchaseStatus(
  transactionId: string, 
  status: 'active' | 'refunded' | 'cancelled'
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot update purchase status');
    return false;
  }

  const { error } = await supabase
    .from('purchases')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('hotmart_transaction_id', transactionId);

  if (error) {
    console.error('Error updating purchase status:', error);
    return false;
  }

  return true;
}

// =============================================
// USER PROFILE FUNCTIONS
// =============================================

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  if (!supabase) {
    console.warn('Supabase not configured - returning null profile');
    return null;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function upsertUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot save profile');
    return false;
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      email: profile.email.toLowerCase(),
      name: profile.name,
      avatar: profile.avatar,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'email'
    });

  if (error) {
    console.error('Error upserting user profile:', error);
    return false;
  }

  return true;
}

// =============================================
// PROTOCOL PROGRESS FUNCTIONS
// =============================================

export async function getProtocolProgress(email: string, productId: string): Promise<number[]> {
  if (!supabase) {
    console.warn('Supabase not configured - returning empty progress');
    return [];
  }

  const { data, error } = await supabase
    .from('protocol_progress')
    .select('completed_days')
    .eq('user_email', email.toLowerCase())
    .eq('product_id', productId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return [];
    }
    console.error('Error fetching protocol progress:', error);
    return [];
  }

  return data?.completed_days || [];
}

export async function updateProtocolProgress(
  email: string, 
  productId: string, 
  completedDays: number[]
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot update protocol progress');
    return false;
  }

  const { error } = await supabase
    .from('protocol_progress')
    .upsert({
      user_email: email.toLowerCase(),
      product_id: productId,
      completed_days: completedDays,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_email,product_id'
    });

  if (error) {
    console.error('Error updating protocol progress:', error);
    return false;
  }

  return true;
}

// =============================================
// WEIGHT ENTRIES FUNCTIONS
// =============================================

export async function getWeightEntries(email: string): Promise<WeightEntry[]> {
  if (!supabase) {
    console.warn('Supabase not configured - returning empty weight entries');
    return [];
  }

  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_email', email.toLowerCase())
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error('Error fetching weight entries:', error);
    return [];
  }

  return data || [];
}

export async function addWeightEntry(email: string, weight: number): Promise<WeightEntry | null> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot add weight entry');
    return null;
  }

  const { data, error } = await supabase
    .from('weight_entries')
    .insert({
      user_email: email.toLowerCase(),
      weight: weight,
      recorded_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding weight entry:', error);
    return null;
  }

  return data;
}

export async function deleteWeightEntry(email: string, entryId: number): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot delete weight entry');
    return false;
  }

  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_email', email.toLowerCase());

  if (error) {
    console.error('Error deleting weight entry:', error);
    return false;
  }

  return true;
}

// =============================================
// ANALYTICS INTERFACES
// =============================================

export interface AnalyticsEvent {
  id?: number;
  user_email: string | null;
  event_name: string;
  product_id: string | null;
  properties: Record<string, any>;
  session_id: string | null;
  device_type: string | null;
  created_at?: string;
}

export interface DailyActiveUsers {
  date: string;
  total_users: number;
  new_users: number;
  returning_users: number;
}

export interface FeatureUsage {
  event_name: string;
  event_count: number;
  unique_users: number;
  product_id?: string;
}

export interface ProductViews {
  product_id: string;
  view_count: number;
  unique_users: number;
  checkout_clicks: number;
}

// =============================================
// ANALYTICS FUNCTIONS
// =============================================

export async function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot track event');
    return false;
  }

  const { error } = await supabase
    .from('analytics_events')
    .insert({
      user_email: event.user_email?.toLowerCase() || null,
      event_name: event.event_name,
      product_id: event.product_id,
      properties: event.properties || {},
      session_id: event.session_id,
      device_type: event.device_type
    });

  if (error) {
    console.error('Error tracking event:', error);
    return false;
  }

  return true;
}

export async function trackEvents(events: Omit<AnalyticsEvent, 'id' | 'created_at'>[]): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot track events');
    return false;
  }

  const formattedEvents = events.map(event => ({
    user_email: event.user_email?.toLowerCase() || null,
    event_name: event.event_name,
    product_id: event.product_id,
    properties: event.properties || {},
    session_id: event.session_id,
    device_type: event.device_type
  }));

  const { error } = await supabase
    .from('analytics_events')
    .insert(formattedEvents);

  if (error) {
    console.error('Error tracking events:', error);
    return false;
  }

  return true;
}

export async function getDailyActiveUsers(startDate: string, endDate: string): Promise<DailyActiveUsers[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.rpc('get_daily_active_users', {
    start_date: startDate,
    end_date: endDate
  });

  if (error) {
    console.error('Error getting DAU:', error);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('analytics_events')
      .select('user_email, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .not('user_email', 'is', null);

    if (fallbackError || !fallbackData) return [];

    const grouped: Record<string, Set<string>> = {};
    fallbackData.forEach((row: any) => {
      const date = row.created_at.split('T')[0];
      if (!grouped[date]) grouped[date] = new Set();
      grouped[date].add(row.user_email);
    });

    return Object.entries(grouped).map(([date, users]) => ({
      date,
      total_users: users.size,
      new_users: 0,
      returning_users: 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  return data || [];
}

export async function getFeatureUsage(startDate: string, endDate: string): Promise<FeatureUsage[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_name, user_email, product_id')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) {
    console.error('Error getting feature usage:', error);
    return [];
  }

  const grouped: Record<string, { count: number; users: Set<string> }> = {};
  
  (data || []).forEach((row: any) => {
    const key = row.event_name;
    if (!grouped[key]) {
      grouped[key] = { count: 0, users: new Set() };
    }
    grouped[key].count++;
    if (row.user_email) {
      grouped[key].users.add(row.user_email);
    }
  });

  return Object.entries(grouped).map(([event_name, stats]) => ({
    event_name,
    event_count: stats.count,
    unique_users: stats.users.size
  })).sort((a, b) => b.event_count - a.event_count);
}

export async function getProductViews(startDate: string, endDate: string): Promise<ProductViews[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_name, user_email, product_id')
    .in('event_name', ['product_view', 'checkout_click'])
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) {
    console.error('Error getting product views:', error);
    return [];
  }

  const grouped: Record<string, { views: number; clicks: number; users: Set<string> }> = {};
  
  (data || []).forEach((row: any) => {
    if (!row.product_id) return;
    
    if (!grouped[row.product_id]) {
      grouped[row.product_id] = { views: 0, clicks: 0, users: new Set() };
    }
    
    if (row.event_name === 'product_view') {
      grouped[row.product_id].views++;
    } else if (row.event_name === 'checkout_click') {
      grouped[row.product_id].clicks++;
    }
    
    if (row.user_email) {
      grouped[row.product_id].users.add(row.user_email);
    }
  });

  return Object.entries(grouped).map(([product_id, stats]) => ({
    product_id,
    view_count: stats.views,
    unique_users: stats.users.size,
    checkout_clicks: stats.clicks
  })).sort((a, b) => b.view_count - a.view_count);
}

export async function getAnalyticsSummary(startDate: string, endDate: string) {
  if (!supabase) {
    return null;
  }

  const { data: totalEvents, error: eventsError } = await supabase
    .from('analytics_events')
    .select('id', { count: 'exact' })
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const { data: uniqueUsersData, error: usersError } = await supabase
    .from('analytics_events')
    .select('user_email')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .not('user_email', 'is', null);

  const { data: allTimeUsersData } = await supabase
    .from('analytics_events')
    .select('user_email')
    .not('user_email', 'is', null);

  const uniqueUsers = new Set((uniqueUsersData || []).map((r: any) => r.user_email)).size;
  const allTimeUsers = new Set((allTimeUsersData || []).map((r: any) => r.user_email)).size;

  return {
    total_events: totalEvents?.length || 0,
    unique_users_period: uniqueUsers,
    all_time_users: allTimeUsers
  };
}

export async function getRecentEvents(limit: number = 50): Promise<AnalyticsEvent[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error getting recent events:', error);
    return [];
  }

  return data || [];
}
