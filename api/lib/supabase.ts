import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;
  
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    return supabase;
  }
  
  return null;
}

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
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
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
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const { error } = await client
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
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const { error } = await client
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
