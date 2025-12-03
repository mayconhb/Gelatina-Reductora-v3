import express from 'express';
import cors from 'cors';
import { 
  getUserPurchases, 
  addPurchase, 
  updatePurchaseStatus,
  getUserProfile,
  upsertUserProfile,
  getProtocolProgress,
  updateProtocolProgress,
  getWeightEntries,
  addWeightEntry,
  deleteWeightEntry,
  trackEvent,
  trackEvents,
  getDailyActiveUsers,
  getFeatureUsage,
  getProductViews,
  getAnalyticsSummary,
  getRecentEvents
} from './supabase';
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

// =============================================
// USER PRODUCTS ENDPOINTS
// =============================================

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

// =============================================
// USER PROFILE ENDPOINTS
// =============================================

app.get('/api/user/profile', async (req, res) => {
  try {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const profile = await getUserProfile(email);
    
    if (profile) {
      res.json({ profile });
    } else {
      res.json({ profile: null });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user/profile', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const success = await upsertUserProfile({ email, name, avatar: avatar || null });
    
    if (success) {
      res.json({ message: 'Profile saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save profile' });
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// PROTOCOL PROGRESS ENDPOINTS
// =============================================

app.get('/api/user/protocol-progress', async (req, res) => {
  try {
    const email = req.query.email as string;
    const productId = req.query.productId as string;
    
    if (!email || !productId) {
      return res.status(400).json({ error: 'Email and productId are required' });
    }

    const completedDays = await getProtocolProgress(email, productId);
    
    res.json({ completedDays });
  } catch (error) {
    console.error('Error fetching protocol progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user/protocol-progress', async (req, res) => {
  try {
    const { email, productId, completedDays } = req.body;
    
    if (!email || !productId || !Array.isArray(completedDays)) {
      return res.status(400).json({ error: 'Email, productId and completedDays array are required' });
    }

    const success = await updateProtocolProgress(email, productId, completedDays);
    
    if (success) {
      res.json({ message: 'Progress saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save progress' });
    }
  } catch (error) {
    console.error('Error saving protocol progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// WEIGHT ENTRIES ENDPOINTS
// =============================================

app.get('/api/user/weight-entries', async (req, res) => {
  try {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const entries = await getWeightEntries(email);
    
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user/weight-entries', async (req, res) => {
  try {
    const { email, weight } = req.body;
    
    if (!email || typeof weight !== 'number') {
      return res.status(400).json({ error: 'Email and weight are required' });
    }

    const entry = await addWeightEntry(email, weight);
    
    if (entry) {
      res.json({ entry });
    } else {
      res.status(500).json({ error: 'Failed to add weight entry' });
    }
  } catch (error) {
    console.error('Error adding weight entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/user/weight-entries/:id', async (req, res) => {
  try {
    const email = req.query.email as string;
    const entryId = parseInt(req.params.id);
    
    if (!email || isNaN(entryId)) {
      return res.status(400).json({ error: 'Email and valid entry ID are required' });
    }

    const success = await deleteWeightEntry(email, entryId);
    
    if (success) {
      res.json({ message: 'Entry deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete entry' });
    }
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// HOTMART WEBHOOK
// =============================================

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

// =============================================
// PRODUCTS INFO
// =============================================

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

// =============================================
// ADMIN ENDPOINTS
// =============================================

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

// =============================================
// ANALYTICS ENDPOINTS
// =============================================

const VALID_EVENT_NAMES = [
  'app_open', 'login', 'logout', 'product_view', 'checkout_click',
  'protocol_day_complete', 'weight_add', 'weight_delete', 'tab_change', 'install_prompt'
];

const trackingRateLimit: Record<string, { count: number; resetTime: number }> = {};
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 100;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = trackingRateLimit[ip];
  
  if (!record || now > record.resetTime) {
    trackingRateLimit[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

app.post('/api/analytics/track', async (req, res) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { event_name, user_email, product_id, properties, session_id, device_type } = req.body;
    
    if (!event_name || !VALID_EVENT_NAMES.includes(event_name)) {
      return res.status(400).json({ error: 'Invalid event_name' });
    }

    const success = await trackEvent({
      event_name,
      user_email: user_email || null,
      product_id: product_id || null,
      properties: properties || {},
      session_id: session_id || null,
      device_type: device_type || null
    });
    
    if (success) {
      res.json({ message: 'Event tracked' });
    } else {
      res.status(500).json({ error: 'Failed to track event' });
    }
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/analytics/track-batch', async (req, res) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { events } = req.body;
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'events array is required' });
    }

    if (events.length > 50) {
      return res.status(400).json({ error: 'Too many events (max 50)' });
    }

    const validEvents = events.filter(e => e.event_name && VALID_EVENT_NAMES.includes(e.event_name));
    
    if (validEvents.length === 0) {
      return res.status(400).json({ error: 'No valid events provided' });
    }

    const success = await trackEvents(validEvents);
    
    if (success) {
      res.json({ message: `${validEvents.length} events tracked` });
    } else {
      res.status(500).json({ error: 'Failed to track events' });
    }
  } catch (error) {
    console.error('Error tracking events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const ADMIN_EMAIL = 'maycon.henriquebezerra@gmail.com';

function verifyAdminAccess(req: express.Request): boolean {
  const adminEmail = req.headers['x-admin-email'] as string;
  console.log('Admin access check - received email:', adminEmail, 'expected:', ADMIN_EMAIL);
  return !!(adminEmail && adminEmail.toLowerCase().trim() === ADMIN_EMAIL);
}

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [dau, featureUsage, productViews, summary] = await Promise.all([
      getDailyActiveUsers(startDate, endDate),
      getFeatureUsage(startDate, endDate),
      getProductViews(startDate, endDate),
      getAnalyticsSummary(startDate, endDate)
    ]);

    res.json({
      period: { start: startDate, end: endDate },
      summary,
      daily_active_users: dau,
      feature_usage: featureUsage,
      product_views: productViews
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/events', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const events = await getRecentEvents(limit);

    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/dau', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const dau = await getDailyActiveUsers(startDate, endDate);

    res.json({ daily_active_users: dau });
  } catch (error) {
    console.error('Error fetching DAU:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/features', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const featureUsage = await getFeatureUsage(startDate, endDate);

    res.json({ feature_usage: featureUsage });
  } catch (error) {
    console.error('Error fetching feature usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/products', async (req, res) => {
  try {
    if (!verifyAdminAccess(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const productViews = await getProductViews(startDate, endDate);

    res.json({ product_views: productViews });
  } catch (error) {
    console.error('Error fetching product views:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
