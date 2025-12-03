import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  
  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminKey = req.headers['x-admin-key'] as string;
    const expectedAdminKey = process.env.ADMIN_API_KEY;

    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email, productId } = req.body;

    if (!email || !productId) {
      return res.status(400).json({ error: 'Email and productId are required' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { error } = await supabase.from('purchases').upsert({
      user_email: email.toLowerCase(),
      product_id: productId,
      hotmart_product_id: 'MANUAL_ADMIN',
      hotmart_transaction_id: `ADMIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      purchased_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'hotmart_transaction_id' });

    if (error) {
      return res.status(500).json({ error: 'Failed to add purchase' });
    }

    res.json({ message: 'Purchase added successfully' });
  } catch (error: any) {
    console.error('Error adding manual purchase:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
