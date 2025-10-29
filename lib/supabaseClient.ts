// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// แนะนำ: ถ้ารันฝั่งเซิร์ฟเวอร์ (API route) ให้ใช้ SERVICE_ROLE_KEY เพื่อหลบ RLS ตอน join/filter ข้ามตาราง
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});
