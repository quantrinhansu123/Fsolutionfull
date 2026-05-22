const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pmpkffexnqrcfauyjemk.supabase.co';
const supabaseKey = 'sb_publishable_z6y903NHQTmeI0e0ksqAFA_Z3mUFU9B';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjects() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('project_id, name, pricing');
    
    if (error) throw error;
    console.log('--- PROJECTS IN DATABASE ---');
    console.log(JSON.stringify(projects, null, 2));

    const { data: tickets, error: ticketError } = await supabase
      .from('tickets')
      .select('id, tieu_de, bo_phan, project_id, trang_thai');
    if (ticketError) throw ticketError;
    console.log('--- TICKETS IN DATABASE ---');
    console.log(JSON.stringify(tickets, null, 2));
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

checkProjects();
