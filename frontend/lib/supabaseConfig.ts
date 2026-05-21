import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rqbbpycsofxiiwuabkom.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYmJweWNzb2Z4aWl3dWFia29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTA4NDMsImV4cCI6MjA2MTU2Njg0M30.RZtdoxOZfvuVOph-Qy3E6io2RfEerddwKylBS3th59w";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;