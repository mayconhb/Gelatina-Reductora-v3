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
