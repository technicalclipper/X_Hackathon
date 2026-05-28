import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cjickdvjcfcfkbfibunn.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaWNrZHZqY2ZjZmtiZmlidW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjY2NjMsImV4cCI6MjA5NTU0MjY2M30.X6hxtA04jzkjPBnTipbPHpOIPzMtQGrqzmHZut-D56Q";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;