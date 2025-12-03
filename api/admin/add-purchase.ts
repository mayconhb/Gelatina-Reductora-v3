import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addPurchase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const success = await addPurchase({
      user_email: email,
      product_id: productId,
      hotmart_product_id: 'MANUAL_ADMIN',
      hotmart_transaction_id: `ADMIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      purchased_at: new Date().toISOString()
    });

    if (success) {
      res.json({ message: 'Purchase added successfully' });
    } else {
      res.status(500).json({ error: 'Failed to add purchase' });
    }
  } catch (error) {
    console.error('Error adding manual purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
