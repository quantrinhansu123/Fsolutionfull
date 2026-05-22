const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pmpkffexnqrcfauyjemk.supabase.co';
const supabaseKey = 'sb_publishable_z6y903NHQTmeI0e0ksqAFA_Z3mUFU9B';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAmc() {
  try {
    const { data: amc, error } = await supabase
      .from('amc_payments')
      .select('*');
    
    if (error) throw error;
    console.log('--- AMC PAYMENTS IN DB ---');
    console.log(JSON.stringify(amc, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAmc();
