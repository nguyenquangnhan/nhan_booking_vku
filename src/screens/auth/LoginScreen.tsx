// src/screens/auth/LoginScreen.tsx
// Màn hình phân tách 2 cổng đăng nhập độc lập: Sinh viên & Cán bộ Quản trị (Admin)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';

type PortalMode = 'user' | 'admin';

export function LoginScreen() {
  const [portal, setPortal] = useState<PortalMode>('user');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginUser = useAuthStore((s) => s.loginUser);
  const loginAdmin = useAuthStore((s) => s.loginAdmin);

  const handleSwitchPortal = (mode: PortalMode) => {
    setPortal(mode);
    setIdentifier('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mã định danh và mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      if (portal === 'user') {
        const res = await loginUser(identifier, password);
        if (!res.success) {
          Alert.alert('Đăng nhập thất bại', res.message || 'Sai thông tin tài khoản');
        }
      } else {
        const res = await loginAdmin(identifier, password);
        if (!res.success) {
          Alert.alert('Từ chối truy cập', res.message || 'Sai thông tin quản trị viên');
        }
      }
    } catch (e: any) {
      Alert.alert('Lỗi hệ thống', e?.message || 'Có lỗi xảy ra khi xác thực');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = portal === 'admin';

  return (
    <SafeAreaView style={[styles.safe, isAdmin && styles.safeAdmin]}>
      <StatusBar barStyle="light-content" backgroundColor={isAdmin ? '#0B1120' : '#1E3A5F'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={[styles.logoBadge, isAdmin && styles.logoBadgeAdmin]}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'school'}
                size={38}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.schoolName}>ĐẠI HỌC CNTT & TRUYỀN THÔNG VIỆT - HÀN</Text>
            <Text style={styles.appTitle}>VKU Study Room Booking</Text>
            <Text style={styles.appSubtitle}>
              {isAdmin
                ? 'Hệ thống Quản lý Giảng đường (Web & Mobile)'
                : 'Cổng Đăng ký & Sử dụng Phòng Tự học Sinh viên'}
            </Text>
          </View>

          {/* Tab chọn cổng đăng nhập riêng biệt */}
          <View style={styles.portalToggleContainer}>
            <TouchableOpacity
              style={[styles.portalTab, !isAdmin && styles.portalTabActiveUser]}
              onPress={() => handleSwitchPortal('user')}
            >
              <Ionicons
                name="school-outline"
                size={18}
                color={!isAdmin ? '#1E3A5F' : '#64748B'}
              />
              <Text
                style={[
                  styles.portalTabText,
                  !isAdmin && styles.portalTabTextActiveUser,
                ]}
              >
                Cổng Sinh viên
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.portalTab, isAdmin && styles.portalTabActiveAdmin]}
              onPress={() => handleSwitchPortal('admin')}
            >
              <Ionicons
                name="shield-outline"
                size={18}
                color={isAdmin ? '#B45309' : '#64748B'}
              />
              <Text
                style={[
                  styles.portalTabText,
                  isAdmin && styles.portalTabTextActiveAdmin,
                ]}
              >
                Cổng Quản trị viên
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Đăng nhập */}
          <View style={styles.card}>
            <View style={styles.portalBadge}>
              <Ionicons
                name={isAdmin ? 'lock-closed' : 'person'}
                size={16}
                color={isAdmin ? '#B45309' : '#1D4ED8'}
              />
              <Text
                style={[
                  styles.portalBadgeText,
                  isAdmin ? { color: '#B45309' } : { color: '#1D4ED8' },
                ]}
              >
                {isAdmin
                  ? 'LUỒNG ĐĂNG NHẬP CÁN BỘ QUẢN LÝ (ADMIN PORTAL)'
                  : 'TÀI KHOẢN ĐƯỢC ADMIN / NHÀ TRƯỜNG CẤP'}
              </Text>
            </View>

            <Text style={styles.portalDesc}>
              {isAdmin
                ? 'Đăng nhập để duyệt đơn đặt phòng, khóa slot khẩn cấp, thêm phòng mới trên Web hoặc App.'
                : 'Sinh viên sử dụng MSSV hoặc Email trường và mật khẩu do quản trị viên cấp để đặt phòng.'}
            </Text>

            {/* Input Mã / Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isAdmin ? 'Mã cán bộ hoặc Email Quản trị' : 'Mã sinh viên (MSSV) hoặc Email VKU'}
              </Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name={isAdmin ? 'shield-outline' : 'id-card-outline'}
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={isAdmin ? 'VD: VKU-ADM01' : 'VD: VKU21SE001'}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  value={identifier}
                  onChangeText={setIdentifier}
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu được cấp</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu..."
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nút Đăng nhập */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isAdmin ? styles.submitButtonAdmin : styles.submitButtonUser,
                isLoading && styles.submitButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading
                  ? 'Đang kiểm tra thông tin...'
                  : isAdmin
                  ? 'Đăng nhập Cổng Quản trị'
                  : 'Đăng nhập & Đặt phòng'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn
            </Text>
            <Text style={styles.footerSubText}>
              Quản lý bởi Phòng Cơ sở Vật chất & Đào tạo VKU • 2026
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1E3A5F',
  },
  safeAdmin: {
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoBadgeAdmin: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderColor: '#F59E0B',
  },
  schoolName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
    textAlign: 'center',
    opacity: 0.85,
  },
  portalToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  portalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  portalTabActiveUser: {
    backgroundColor: '#FFFFFF',
  },
  portalTabActiveAdmin: {
    backgroundColor: '#FEF3C7',
  },
  portalTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  portalTabTextActiveUser: {
    color: '#1E3A5F',
    fontWeight: '700',
  },
  portalTabTextActiveAdmin: {
    color: '#92400E',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  portalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  portalDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  eyeBtn: {
    padding: 6,
  },
  submitButton: {
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonUser: {
    backgroundColor: '#1E3A5F',
  },
  submitButtonAdmin: {
    backgroundColor: '#D97706',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
    textAlign: 'center',
  },
});
