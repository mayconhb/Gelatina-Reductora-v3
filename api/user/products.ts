import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserPurchases } from '../lib/supabase';
import { getAllAppProductIds } from '../lib/productMapping';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const purchases = await getUserPurchases(email);
    const purchasedProductIds = purchases.map(p => p.product_id);
    const allProductIds = getAllAppProductIds();
    
    const lockedProductIds = allProductIds.filter(id => !purchasedProductIds.includes(id));

    res.json({
      email: email.toLowerCase(),
      purchasedProducts: purchasedProductIds,
      lockedProducts: lockedProductIds
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
