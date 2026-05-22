import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL hoặc Publishable Key chưa được cấu hình trong file .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
