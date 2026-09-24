// src/store/useUserStore.ts
// Store quản lý danh sách tài khoản User do Admin cấp – đồng bộ Supabase

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser } from '../types';
import { supabase } from '../lib/supabase';

const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-sv-001',
    name: 'Nguyễn Văn An',
    studentId: 'VKU21SE001',
    code: 'VKU21SE001',
    email: 'an.nguyen@student.vku.udn.vn',
    password: 'sv123456',
    role: 'user',
    department: 'Khoa Công nghệ Thông tin & Truyền thông',
  },
  {
    id: 'usr-sv-002',
    name: 'Lê Thị Mai',
    studentId: 'VKU22IT045',
    code: 'VKU22IT045',
    email: 'mai.le@student.vku.udn.vn',
    password: 'sv123456',
    role: 'user',
    department: 'Khoa Kỹ thuật Máy tính & Điện tử',
  },
  {
    id: 'usr-sv-003',
    name: 'Trần Quốc Bảo',
    studentId: 'VKU21AI012',
    code: 'VKU21AI012',
    email: 'bao.tran@student.vku.udn.vn',
    password: 'sv123456',
    role: 'user',
    department: 'Khoa Trí tuệ Nhân tạo',
  },
];

interface UserState {
  users: AppUser[];
  loadUsersFromSupabase: () => Promise<void>;
  addUser: (newUser: AppUser, adminId?: string) => Promise<boolean>;
  updateUserPassword: (userId: string, newPass: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: INITIAL_USERS,

      loadUsersFromSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'user')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mapped: AppUser[] = data.map((u: any) => ({
              id: u.id,
              name: u.name,
              studentId: u.code,
              code: u.code,
              email: u.email,
              password: u.password,
              role: 'user',
              department: u.department,
            }));
            set({ users: mapped });
          }
        } catch (e) {
          console.warn('[useUserStore] Could not load from Supabase:', e);
        }
      },

      addUser: async (newUser: AppUser, adminId?: string) => {
        // Cập nhật local trước
        set((state) => ({
          users: [newUser, ...state.users],
        }));

        // Ghi lên Supabase
        try {
          await supabase.from('users').insert({
            id: newUser.id,
            name: newUser.name,
            code: newUser.code || newUser.studentId,
            email: newUser.email,
            password: newUser.password || 'sv123456',
            role: 'user',
            department: newUser.department,
            is_active: true,
            created_by: adminId || 'usr-admin-001',
          } as never);
          return true;
        } catch (e) {
          console.warn('[useUserStore] Lỗi thêm user lên Supabase:', e);
          return true;
        }
      },

      updateUserPassword: async (userId: string, newPass: string) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, password: newPass } : u
          ),
        }));

        try {
          await supabase
            .from('users')
            .update({ password: newPass } as never)
            .eq('id', userId);
        } catch (e) {
          console.warn('[useUserStore] Lỗi cập nhật mật khẩu trên Supabase:', e);
        }
      },

      deleteUser: async (userId: string) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }));

        try {
          await supabase.from('users').delete().eq('id', userId);
        } catch (e) {
          console.warn('[useUserStore] Lỗi xoá user trên Supabase:', e);
        }
      },
    }),
    {
      name: 'vku-users-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
