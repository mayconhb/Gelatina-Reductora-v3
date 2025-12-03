import { createClient } from '@supabase/supabase-js';
import { getAppProductId } from '../_shared/products';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  
  return null;
}

function verifyHotmartToken(token: string): boolean {
  const HOTMART_WEBHOOK_TOKEN = process.env.HOTMART_WEBHOOK_SECRET || '';
  
  if (!HOTMART_WEBHOOK_TOKEN) {
    return true;
  }
  
  return token === HOTMART_WEBHOOK_TOKEN;
}

export default async function handler(req: any, res: any) {
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
    const token = req.headers['x-hotmart-hottok'] || '';
    
    if (!verifyHotmartToken(token)) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const event = req.body;

    if (!event || !event.event) {
      return res.status(200).json({ message: 'Webhook endpoint is working' });
    }

    const buyerEmail = event.data?.buyer?.email;
    const hotmartProductId = event.data?.product?.id?.toString();
    const transactionId = event.data?.purchase?.transaction;

    if (!buyerEmail || !hotmartProductId || !transactionId) {
      return res.status(200).json({ message: 'Webhook received (test or incomplete data)' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(200).json({ 
        message: 'Webhook received but database not configured',
        warning: 'Configure SUPABASE_URL and SUPABASE_SERVICE_KEY'
      });
    }

    const appProductId = getAppProductId(hotmartProductId);
    
    if (!appProductId) {
      return res.status(200).json({ message: 'Product not mapped, ignoring' });
    }

    if (event.event === 'PURCHASE_APPROVED' || event.event === 'PURCHASE_COMPLETE') {
      await supabase.from('purchases').upsert({
        user_email: buyerEmail.toLowerCase(),
        product_id: appProductId,
        hotmart_product_id: hotmartProductId,
        hotmart_transaction_id: transactionId,
        status: 'active',
        purchased_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'hotmart_transaction_id' });
    } else if (event.event === 'PURCHASE_REFUNDED') {
      await supabase.from('purchases')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('hotmart_transaction_id', transactionId);
    } else if (event.event === 'PURCHASE_CANCELED' || event.event === 'PURCHASE_CHARGEBACK') {
      await supabase.from('purchases')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('hotmart_transaction_id', transactionId);
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    return res.status(200).json({ 
      message: 'Webhook received with error',
      error: error?.message || 'Unknown error'
    });
  }
}
