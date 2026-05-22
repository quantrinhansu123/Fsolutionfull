const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pmpkffexnqrcfauyjemk.supabase.co';
const supabaseKey = 'sb_publishable_z6y903NHQTmeI0e0ksqAFA_Z3mUFU9B';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLoai() {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('id, tieu_de, bo_phan, loai');
    
    if (error) throw error;
    console.log('--- TICKETS WITH LOAI ---');
    console.log(JSON.stringify(tickets, null, 2));

    // Get all unique loai values
    const uniqueLoais = [...new Set(tickets.map(t => t.loai))];
    console.log('--- UNIQUE LOAI VALUES IN DB ---', uniqueLoais);
  } catch (err) {
    console.error('Error:', err);
  }
}

checkLoai();
