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
      const productId = req.query.productId as string;
      
      if (!email || !productId) {
        return res.status(400).json({ error: 'Email and productId are required' });
      }

      if (!supabase) {
        return res.json({ completedDays: [] });
      }

      const { data, error } = await supabase
        .from('protocol_progress')
        .select('completed_days')
        .eq('user_email', email.toLowerCase())
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching progress:', error);
        return res.status(500).json({ error: 'Failed to fetch progress' });
      }

      res.json({ completedDays: data?.completed_days || [] });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ error: error?.message || 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { email, productId, completedDays } = req.body;
      
      if (!email || !productId || !Array.isArray(completedDays)) {
        return res.status(400).json({ error: 'Email, productId and completedDays array are required' });
      }

      if (!supabase) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const { error } = await supabase
        .from('protocol_progress')
        .upsert({
          user_email: email.toLowerCase(),
          product_id: productId,
          completed_days: completedDays,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_email,product_id'
        });

      if (error) {
        console.error('Error saving progress:', error);
        return res.status(500).json({ error: 'Failed to save progress' });
      }

      res.json({ message: 'Progress saved successfully' });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ error: error?.message || 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
