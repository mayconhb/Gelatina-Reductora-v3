import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addPurchase, updatePurchaseStatus, getSupabaseClient } from '../_lib/supabase';
import { getAppProductId } from '../_lib/productMapping';

function verifyHotmartToken(token: string): boolean {
  const HOTMART_WEBHOOK_TOKEN = process.env.HOTMART_WEBHOOK_SECRET || '';
  
  if (!HOTMART_WEBHOOK_TOKEN) {
    console.warn('Warning: HOTMART_WEBHOOK_SECRET not configured. Webhook verification disabled.');
    return true;
  }
  
  return token === HOTMART_WEBHOOK_TOKEN;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-hotmart-hottok');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers['x-hotmart-hottok'] as string || '';
    
    if (!verifyHotmartToken(token)) {
      console.error('Invalid Hotmart webhook token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    const event = req.body;
    
    console.log('Hotmart webhook received:', JSON.stringify(event, null, 2));

    if (!event || !event.event) {
      console.log('Test ping or empty payload received');
      return res.status(200).json({ message: 'Webhook endpoint is working' });
    }

    const buyerEmail = event.data?.buyer?.email;
    const hotmartProductId = event.data?.product?.id?.toString();
    const transactionId = event.data?.purchase?.transaction;

    if (!buyerEmail || !hotmartProductId || !transactionId) {
      console.log('Missing fields - this might be a test webhook');
      return res.status(200).json({ message: 'Webhook received (test or incomplete data)' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase not configured - SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
      return res.status(200).json({ 
        message: 'Webhook received but database not configured',
        warning: 'Configure SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
      });
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
    res.status(200).json({ 
      message: 'Webhook received with error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
