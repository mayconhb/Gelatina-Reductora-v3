import { getProductInfo } from '../../_shared/products';

export default function handler(req: any, res: any) {
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
    const { productId } = req.query;
    
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = getProductInfo(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error: any) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
