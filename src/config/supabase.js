import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please create a .env file in the root directory with:');
  console.error('REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co');
  console.error('REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here');
  console.error('');
  console.error('Get these from your Supabase Dashboard → Settings → API');
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are required. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

