import { createClient } from '@supabase/supabase-js';

const VALID_EVENT_NAMES = [
  'app_open', 'login', 'logout', 'product_view', 'checkout_click',
  'protocol_day_complete', 'weight_add', 'weight_delete', 'tab_change', 'install_prompt'
];

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  
  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    
    if (!event || !event.event_name) {
      return res.status(400).json({ error: 'event_name is required' });
    }

    if (!VALID_EVENT_NAMES.includes(event.event_name)) {
      return res.status(400).json({ error: 'Invalid event_name' });
    }

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return res.json({ message: 'Event received (demo mode)' });
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_email: event.user_email?.toLowerCase() || null,
        event_name: event.event_name,
        product_id: event.product_id || null,
        properties: event.properties || {},
        session_id: event.session_id || null,
        device_type: event.device_type || null
      });

    if (error) {
      console.error('Error tracking event:', error);
      return res.status(500).json({ error: 'Failed to track event' });
    }

    res.json({ message: 'Event tracked' });
  } catch (error: any) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
