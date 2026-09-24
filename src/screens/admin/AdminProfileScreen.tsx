// src/screens/admin/AdminProfileScreen.tsx
// Màn hình hồ sơ quản trị viên VKU & cấu hình hệ thống

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useBookingStore } from '../../store/useBookingStore';

export function AdminProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resetToMock = useRoomStore((s) => s.resetToMock);
  const clearAllBookings = useBookingStore((s) => s.clearAll);

  const handleResetData = () => {
    Alert.alert(
      'Đặt lại dữ liệu',
      'Thao tác này sẽ khôi phục danh sách phòng học VKU về dữ liệu mặc định ban đầu.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lại',
          style: 'destructive',
          onPress: () => {
            resetToMock();
            Alert.alert('Thành công', 'Đã khôi phục dữ liệu phòng học');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản quản trị?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Admin Card */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.name}>{user?.name || 'ThS. Trần Quản Lý'}</Text>
          <Text style={styles.badgeText}>QUẢN TRỊ VIÊN HỆ THỐNG</Text>
          <Text style={styles.idText}>Mã cán bộ: {user?.studentId || 'VKU-ADM01'}</Text>
        </View>

        {/* Thông tin cán bộ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THÔNG TIN CÁN BỘ QUẢN LÝ</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email liên hệ</Text>
              <Text style={styles.infoValue}>{user?.email || 'admin@vku.udn.vn'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Đơn vị phụ trách</Text>
              <Text style={styles.infoValue}>
                {user?.department || 'Phòng Quản lý Cơ sở Vật chất & Giảng đường VKU'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phạm vi quản lý</Text>
              <Text style={styles.infoValue}>Khu A & Khu V (Đại học VKU)</Text>
            </View>
          </View>
        </View>

        {/* Database & System Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KẾT NỐI HỆ THỐNG & SUPABASE</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="server" size={16} color="#059669" />
                <Text style={styles.infoLabel}>Supabase Database</Text>
              </View>
              <View style={styles.connectedTag}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>Đã kết nối</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Project URL</Text>
              <Text style={styles.infoValueSmall}>oqbyihccbwgkqvneyjhk.supabase.co</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phiên bản App</Text>
              <Text style={styles.infoValue}>v1.0.0 (Phase 3)</Text>
            </View>
          </View>
        </View>

        {/* Tùy chọn & Thao tác */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÙY CHỌN HỆ THỐNG</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={handleResetData}
            >
              <Ionicons name="refresh-outline" size={20} color="#D97706" />
              <Text style={[styles.menuRowText, { color: '#B45309' }]}>
                Khôi phục danh mục phòng về mặc định
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={[styles.menuRowText, { color: '#DC2626' }]}>
                Đăng xuất tài khoản
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  idText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '60%',
    textAlign: 'right',
  },
  infoValueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  connectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#03543F',
  },
  switchRoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  switchIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  switchTextWrap: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 11,
    color: '#4B5563',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  menuRowText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
