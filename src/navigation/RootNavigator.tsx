// src/navigation/RootNavigator.tsx
// Điều hướng chính: Phân quyền Đăng nhập, Sinh viên và Quản trị viên (Admin)

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { UserNavigator } from './UserNavigator';
import { AdminNavigator } from './AdminNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (role === 'admin') {
    return <AdminNavigator />;
  }

  return <UserNavigator />;
}
