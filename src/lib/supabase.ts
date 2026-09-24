// src/lib/supabase.ts
// Supabase client cho Expo/React Native

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://oqbyihccbwgkqvneyjhk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_aNyLNOU7JkbfriYnaZnWzQ_IFC2H7cj';

// Không truyền generic Database ở đây để tránh conflict với kiểu tự generate
// Dùng explicit casting ở mỗi query thay thế
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
