import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllProductsInfo } from '../_lib/productMapping';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const products = getAllProductsInfo();
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
