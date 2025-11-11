const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.warn('   The application will not work without these variables.');
}

let supabase = null;
if (supabaseUrl && supabaseKey) {
  // Initialize Supabase client with service role key
  // Service role key should bypass RLS automatically
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });
  console.log('✅ Connected to Supabase database');
} else {
  console.error('❌ Failed to initialize Supabase client. Check your environment variables.');
}

const dbHelpers = {
  run: async (sql, params = []) => {
    throw new Error('Use Supabase client directly in models instead of dbHelpers.run');
  },
  
  get: async (sql, params = []) => {
    throw new Error('Use Supabase client directly in models instead of dbHelpers.get');
  },
  
  all: async (sql, params = []) => {
    throw new Error('Use Supabase client directly in models instead of dbHelpers.all');
  },
  
  close: async () => {
    return Promise.resolve();
  }
};

module.exports = { 
  db: supabase, 
  supabase,
  dbHelpers, 
  client: 'supabase' 
};
