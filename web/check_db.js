const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('\n--- Checking Tables ---');
  
  // Test query on profiles
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  if (pError) {
    console.error('Error querying profiles:', pError);
  } else {
    console.log('Successfully queried profiles table. Rows found:', profiles.length);
  }

  // Test query on transactions
  const { data: txs, error: tError } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);
  if (tError) {
    console.error('Error querying transactions:', tError);
  } else {
    console.log('Successfully queried transactions table. Rows found:', txs.length);
  }

  // Test query on investments
  const { data: invs, error: iError } = await supabase
    .from('investments')
    .select('*')
    .limit(1);
  if (iError) {
    console.error('Error querying investments:', iError);
  } else {
    console.log('Successfully queried investments table. Rows found:', invs.length);
  }

  console.log('\n--- Checking RPC functions ---');
  
  // Test RPC convert_currency
  const { data: convData, error: convError } = await supabase.rpc('convert_currency', {
    p_user_id: '00000000-0000-0000-0000-000000000000',
    p_from_currency: 'NGN',
    p_amount: 100,
    p_exchange_rate: 1200,
    p_fees: 50
  });
  if (convError) {
    console.log('RPC convert_currency error (expected a profile error, but let\'s see what):', convError.message, convError.code);
  } else {
    console.log('RPC convert_currency response:', convData);
  }

  // Test RPC create_investment
  const { data: invData, error: invRpcError } = await supabase.rpc('create_investment', {
    p_user_id: '00000000-0000-0000-0000-000000000000',
    p_amount: 100,
    p_currency: 'NGN',
    p_roi_percent: 15,
    p_duration_months: 6
  });
  if (invRpcError) {
    console.log('RPC create_investment error:', invRpcError.message, invRpcError.code);
  } else {
    console.log('RPC create_investment response:', invData);
  }
}

checkDatabase();
