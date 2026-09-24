// src/lib/supabase.ts
// Supabase client cho Expo/React Native
// Đọc cấu hình từ biến môi trường (.env) — prefix EXPO_PUBLIC_ cho phép truy cập trên cả mobile và web

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'https://oqbyihccbwgkqvneyjhk.supabase.co'; // fallback cho dev

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_aNyLNOU7JkbfriYnaZnWzQ_IFC2H7cj'; // fallback cho dev

// Không truyền generic Database ở đây để tránh conflict với kiểu tự generate
// Dùng explicit casting ở mỗi query thay thế
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
