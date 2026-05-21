import { createClient } from '@supabase/supabase-js'
const supabaseUrl:any = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey:any = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient("https://rqbbpycsofxiiwuabkom.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYmJweWNzb2Z4aWl3dWFia29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTA4NDMsImV4cCI6MjA2MTU2Njg0M30.RZtdoxOZfvuVOph-Qy3E6io2RfEerddwKylBS3th59w")

export default supabase;