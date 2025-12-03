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
    const { events } = req.body;
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'events array is required' });
    }

    if (events.length > 50) {
      return res.status(400).json({ error: 'Too many events (max 50)' });
    }

    const validEvents = events.filter((e: any) => e.event_name && VALID_EVENT_NAMES.includes(e.event_name));
    
    if (validEvents.length === 0) {
      return res.status(400).json({ error: 'No valid events provided' });
    }

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return res.json({ message: `${validEvents.length} events received (demo mode)` });
    }

    const formattedEvents = validEvents.map((event: any) => ({
      user_email: event.user_email?.toLowerCase() || null,
      event_name: event.event_name,
      product_id: event.product_id || null,
      properties: event.properties || {},
      session_id: event.session_id || null,
      device_type: event.device_type || null
    }));

    const { error } = await supabase
      .from('analytics_events')
      .insert(formattedEvents);

    if (error) {
      console.error('Error tracking events:', error);
      return res.status(500).json({ error: 'Failed to track events' });
    }

    res.json({ message: `${validEvents.length} events tracked` });
  } catch (error: any) {
    console.error('Error tracking events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
