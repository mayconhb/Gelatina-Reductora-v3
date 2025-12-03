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
        return res.json({ profile: null });
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      res.json({ profile: data || null });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ error: error?.message || 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { email, name, avatar } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
      }

      if (!supabase) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          email: email.toLowerCase(),
          name,
          avatar: avatar || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        });

      if (error) {
        console.error('Error saving profile:', error);
        return res.status(500).json({ error: 'Failed to save profile' });
      }

      res.json({ message: 'Profile saved successfully' });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ error: error?.message || 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
