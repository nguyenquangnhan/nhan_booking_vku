// src/store/useAuthStore.ts
// Quản lý xác thực độc lập cho Sinh viên (User) và Quản trị viên (Admin)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser, UserRole } from '../types';
import { supabase } from '../lib/supabase';

export const DEFAULT_USER: AppUser = {
  id: 'usr-sv-001',
  name: 'Nguyễn Văn An',
  studentId: 'VKU21SE001',
  code: 'VKU21SE001',
  role: 'user',
  email: 'an.nguyen@student.vku.udn.vn',
  department: 'Khoa Công nghệ Thông tin & Truyền thông',
};

export const DEFAULT_ADMIN: AppUser = {
  id: 'usr-admin-001',
  name: 'ThS. Trần Quản Lý',
  studentId: 'VKU-ADM01',
  code: 'VKU-ADM01',
  role: 'admin',
  email: 'admin@vku.udn.vn',
  department: 'Phòng Quản lý Cơ sở Vật chất & Giảng đường VKU',
};

interface AuthState {
  user: AppUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginUser: (codeOrEmail: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginAdmin: (codeOrEmail: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: 'user',
      isAuthenticated: false,

      loginUser: async (codeOrEmail: string, pass: string) => {
        const cleanId = codeOrEmail.trim().toLowerCase();
        const cleanPass = pass.trim();

        try {
          // Thử truy vấn bảng users trên Supabase
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`code.ilike.${cleanId},email.ilike.${cleanId}`)
            .eq('password', cleanPass)
            .eq('role', 'user')
            .single();

          if (!error && data) {
            const loggedIn: AppUser = {
              id: data.id,
              name: data.name,
              studentId: data.code,
              code: data.code,
              role: 'user',
              email: data.email,
              department: data.department,
            };
            set({ user: loggedIn, role: 'user', isAuthenticated: true });
            return { success: true };
          }
        } catch (e) {
          console.warn('[useAuthStore] Supabase check failed, checking fallback:', e);
        }

        // Fallback kiểm tra tài khoản mặc định (khi offline hoặc chưa chạy SQL)
        if (
          (cleanId === 'vku21se001' || cleanId === 'an.nguyen@student.vku.udn.vn') &&
          cleanPass === 'sv123456'
        ) {
          set({ user: DEFAULT_USER, role: 'user', isAuthenticated: true });
          return { success: true };
        }

        return {
          success: false,
          message: 'MSSV/Email hoặc Mật khẩu không chính xác. Mật khẩu mặc định do Admin cấp: sv123456',
        };
      },

      loginAdmin: async (codeOrEmail: string, pass: string) => {
        const cleanId = codeOrEmail.trim().toLowerCase();
        const cleanPass = pass.trim();

        try {
          // Thử truy vấn tài khoản Admin trên Supabase
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`code.ilike.${cleanId},email.ilike.${cleanId}`)
            .eq('password', cleanPass)
            .eq('role', 'admin')
            .single();

          if (!error && data) {
            const loggedInAdmin: AppUser = {
              id: data.id,
              name: data.name,
              studentId: data.code,
              code: data.code,
              role: 'admin',
              email: data.email,
              department: data.department,
            };
            set({ user: loggedInAdmin, role: 'admin', isAuthenticated: true });
            return { success: true };
          }
        } catch (e) {
          console.warn('[useAuthStore] Supabase admin check failed:', e);
        }

        // Fallback tài khoản Admin mặc định
        if (
          (cleanId === 'vku-adm01' || cleanId === 'admin@vku.udn.vn') &&
          cleanPass === 'admin123'
        ) {
          set({ user: DEFAULT_ADMIN, role: 'admin', isAuthenticated: true });
          return { success: true };
        }

        return {
          success: false,
          message: 'Mã cán bộ hoặc Mật khẩu Quản trị không chính xác (Mặc định: VKU-ADM01 / admin123)',
        };
      },

      logout: () => {
        set({
          user: null,
          role: 'user',
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'vku-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
