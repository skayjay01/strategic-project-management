import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkrshjqrevwdnnaxulxf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcnNoanFyZXZ3ZG5uYXh1bHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTExNTcsImV4cCI6MjA4ODM4NzE1N30.6yEjtAYh1LuFpMkeqKo_vp2BCY0BPjerN3Cd3O75dCs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
