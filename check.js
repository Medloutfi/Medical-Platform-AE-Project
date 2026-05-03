import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://witbymlhutssuwjfbzfq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpdGJ5bWxodXRzc3V3amZiemZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTAzNDIsImV4cCI6MjA5MzMyNjM0Mn0.SqmMJvdHCAcsbPefRYbSE5Tfs84sC9BW5EHW7nhLIzU";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('users').select('*');
  console.log("USERS:", JSON.stringify(data, null, 2));
  console.log("ERROR:", error);
}

check();
