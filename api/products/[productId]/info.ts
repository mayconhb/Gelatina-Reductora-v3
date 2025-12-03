const PRODUCT_MAPPINGS = [
  {
    name: "Gelatina Reductora",
    appProductId: "p1",
    hotmartProductId: "6694071",
    offerCode: "8pqi3d4c"
  },
  {
    name: "Desinflamación de 7 días",
    appProductId: "p2",
    hotmartProductId: "HOTMART_PRODUCT_2",
    offerCode: ""
  },
  {
    name: "Registro de Evolución",
    appProductId: "p3",
    hotmartProductId: "HOTMART_PRODUCT_3",
    offerCode: ""
  },
  {
    name: "Acelerador 14 Días",
    appProductId: "l1",
    hotmartProductId: "HOTMART_PRODUCT_L1",
    offerCode: ""
  },
  {
    name: "Quema-Grasa Mientras Duermes",
    appProductId: "l2",
    hotmartProductId: "HOTMART_PRODUCT_L2",
    offerCode: ""
  }
];

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

    const product = PRODUCT_MAPPINGS.find(m => m.appProductId === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error: any) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
