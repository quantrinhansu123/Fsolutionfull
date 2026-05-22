const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pmpkffexnqrcfauyjemk.supabase.co';
const supabaseKey = 'sb_publishable_z6y903NHQTmeI0e0ksqAFA_Z3mUFU9B';

const supabase = createClient(supabaseUrl, supabaseKey);

const candidates = [
  'test',
  'training',
  'deploy',
  'cs',
  'cs_test',
  'cs_training',
  'cs_deploy',
  'cs_ticket',
  'cs_support'
];

async function testCandidates() {
  for (const loai of candidates) {
    try {
      console.log(`Testing insert for CS with loai: "${loai}"...`);
      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          ma_ticket: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
          tieu_de: `Test CS ticket constraint ${loai}`,
          loai: loai,
          bo_phan: 'cs',
          trang_thai: 'in_progress',
          diem: 0,
          thu_nhap: 0,
          so_lan_reopen: 0,
          bug_do_dev: false,
          khach_xac_nhan: false,
          loi_sau_trien_khai: false,
          hop_le: false,
          do_uu_tien: 'medium'
        }])
        .select();

      if (error) {
        console.log(`❌ Failed: ${error.message}`);
      } else {
        console.log(`✅ Success! Inserted ID: ${data[0].id}`);
        // Clean up
        await supabase.from('tickets').delete().eq('id', data[0].id);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }
}

testCandidates();
