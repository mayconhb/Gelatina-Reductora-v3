import express from 'express';
import cors from 'cors';
import { getUserPurchases, addPurchase, updatePurchaseStatus } from './supabase';
import { getAppProductId, getAllAppProductIds, getAllProductsInfo, getProductInfo } from './productMapping';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const HOTMART_WEBHOOK_TOKEN = process.env.HOTMART_WEBHOOK_SECRET || '';

function verifyHotmartToken(token: string): boolean {
  if (!HOTMART_WEBHOOK_TOKEN) {
    console.warn('Warning: HOTMART_WEBHOOK_SECRET not configured. Webhook verification disabled - this is insecure for production!');
    return true;
  }
  
  return token === HOTMART_WEBHOOK_TOKEN;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/user/products', async (req, res) => {
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
});

app.post('/api/hotmart/webhook', async (req, res) => {
  try {
    const token = req.headers['x-hotmart-hottok'] as string || '';
    
    if (!verifyHotmartToken(token)) {
      console.error('Invalid Hotmart webhook token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    const event = req.body;
    
    console.log('Hotmart webhook received:', event.event);

    const buyerEmail = event.data?.buyer?.email;
    const hotmartProductId = event.data?.product?.id?.toString();
    const transactionId = event.data?.purchase?.transaction;

    if (!buyerEmail || !hotmartProductId || !transactionId) {
      console.error('Missing required fields in webhook payload');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const appProductId = getAppProductId(hotmartProductId);
    
    if (!appProductId) {
      console.warn(`Unknown Hotmart product ID: ${hotmartProductId}`);
      return res.status(200).json({ message: 'Product not mapped, ignoring' });
    }

    switch (event.event) {
      case 'PURCHASE_APPROVED':
      case 'PURCHASE_COMPLETE':
        await addPurchase({
          user_email: buyerEmail,
          product_id: appProductId,
          hotmart_product_id: hotmartProductId,
          hotmart_transaction_id: transactionId,
          status: 'active',
          purchased_at: new Date().toISOString()
        });
        console.log(`Purchase recorded for ${buyerEmail} - Product: ${appProductId}`);
        break;

      case 'PURCHASE_REFUNDED':
        await updatePurchaseStatus(transactionId, 'refunded');
        console.log(`Refund processed for transaction: ${transactionId}`);
        break;

      case 'PURCHASE_CANCELED':
      case 'PURCHASE_CHARGEBACK':
        await updatePurchaseStatus(transactionId, 'cancelled');
        console.log(`Cancellation processed for transaction: ${transactionId}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing Hotmart webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para retornar informações dos produtos (incluindo offerCode para checkout)
app.get('/api/products/info', (req, res) => {
  try {
    const products = getAllProductsInfo();
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:productId/info', (req, res) => {
  try {
    const productId = req.params.productId;
    const product = getProductInfo(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/add-purchase', async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
