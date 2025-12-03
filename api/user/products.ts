import { createClient } from '@supabase/supabase-js';
import { getAllAppProductIds } from '../../shared/products';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const supabase = getSupabaseClient();
    let purchasedProductIds: string[] = [];

    if (supabase) {
      const { data } = await supabase
        .from('purchases')
        .select('product_id')
        .eq('user_email', email.toLowerCase())
        .eq('status', 'active');
      
      purchasedProductIds = (data || []).map((p: any) => p.product_id);
    }

    const allProductIds = getAllAppProductIds();
    const lockedProductIds = allProductIds.filter(id => !purchasedProductIds.includes(id));

    res.json({
      email: email.toLowerCase(),
      purchasedProducts: purchasedProductIds,
      lockedProducts: lockedProductIds
    });
  } catch (error: any) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
