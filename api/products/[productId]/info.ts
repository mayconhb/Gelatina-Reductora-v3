import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProductInfo } from '../../_lib/productMapping';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;
    
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = getProductInfo(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
