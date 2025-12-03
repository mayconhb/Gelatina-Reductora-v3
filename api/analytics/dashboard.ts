import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'maycon.henriquebezerra@gmail.com';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  
  return null;
}

function verifyAdminAccess(req: any): boolean {
  const adminEmail = req.headers['x-admin-email'] as string;
  return !!(adminEmail && adminEmail.toLowerCase().trim() === ADMIN_EMAIL);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdminAccess(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = getSupabaseClient();
    
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    if (!supabase) {
      return res.json({
        period: { start: startDate, end: endDate },
        summary: null,
        daily_active_users: [],
        feature_usage: [],
        product_views: []
      });
    }

    const [dau, featureUsage, productViews, summary] = await Promise.all([
      getDailyActiveUsers(supabase, startDate, endDate),
      getFeatureUsage(supabase, startDate, endDate),
      getProductViews(supabase, startDate, endDate),
      getAnalyticsSummary(supabase, startDate, endDate)
    ]);

    res.json({
      period: { start: startDate, end: endDate },
      summary,
      daily_active_users: dau,
      feature_usage: featureUsage,
      product_views: productViews
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getDailyActiveUsers(supabase: any, startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase.rpc('get_daily_active_users', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
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
        total_users: users.size
      })).sort((a, b) => a.date.localeCompare(b.date));
    }

    return data || [];
  } catch (err) {
    console.error('Error getting DAU:', err);
    return [];
  }
}

async function getFeatureUsage(supabase: any, startDate: string, endDate: string) {
  try {
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
  } catch (err) {
    console.error('Error getting feature usage:', err);
    return [];
  }
}

async function getProductViews(supabase: any, startDate: string, endDate: string) {
  try {
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
  } catch (err) {
    console.error('Error getting product views:', err);
    return [];
  }
}

async function getAnalyticsSummary(supabase: any, startDate: string, endDate: string) {
  try {
    const { data: totalEvents } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact' })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data: uniqueUsersData } = await supabase
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
  } catch (err) {
    console.error('Error getting summary:', err);
    return null;
  }
}
