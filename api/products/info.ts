import { getAllProductsInfo } from '../../shared/products';

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
    res.json({ products: getAllProductsInfo() });
  } catch (error: any) {
    console.error('Error fetching products info:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
