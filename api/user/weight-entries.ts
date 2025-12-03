import { createClient } from '@supabase/supabase-js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  if (req.method === 'GET') {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      if (!supabase) {
        return res.json({ entries: [] });
      }

      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_email', email.toLowerCase())
        .order('recorded_at', { ascending: true });

      if (error) {
        console.error('Error fetching entries:', error);
        return res.status(500).json({ error: 'Failed to fetch entries' });
      }

      res.json({ entries: data || [] });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ error: error?.message || 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { email, weight } = req.body;
      
      if (!email || typeof weight !== 'number') {
        return res.status(400).json({ error: 'Email and weight are required' });
      }

      if (!supabase) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const { data, error } = await supabase
        .from('weight_entries')
        .insert({
          user_email: email.toLowerCase(),
          weight: weight,
          recorded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        return res.status(500).json({ error: 'Failed to add entry' });
      }

      res.json({ entry: data });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ error: error?.message || 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
