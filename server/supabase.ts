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
