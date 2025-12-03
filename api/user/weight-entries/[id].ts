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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const email = req.query.email as string;
    const entryId = parseInt(req.query.id as string);
    
    if (!email || isNaN(entryId)) {
      return res.status(400).json({ error: 'Email and valid entry ID are required' });
    }

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_email', email.toLowerCase());

    if (error) {
      console.error('Error deleting entry:', error);
      return res.status(500).json({ error: 'Failed to delete entry' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
