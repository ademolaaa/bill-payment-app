const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error querying profiles:', error);
  } else {
    console.log('Columns in profiles:', data.length > 0 ? Object.keys(data[0]) : 'No rows to inspect columns, testing select keys...');
    
    // Test selecting specific fields to see if they exist
    const { error: eError } = await supabase.from('profiles').select('email, phone').limit(1);
    if (eError) {
      console.log('email/phone columns do not exist:', eError.message);
    } else {
      console.log('email and phone columns exist!');
    }
  }
}

run();
