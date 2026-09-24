// src/screens/admin/AdminDashboardScreen.tsx
// Màn hình tổng quan & thống kê quản trị viên VKU

import React, { useCallback } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useRoomStore } from '../../store/useRoomStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';

export function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const rooms = useRoomStore((s) => s.rooms);
  const bookings = useBookingStore((s) => s.bookings);
  const updateBookingStatus = useBookingStore((s) => s.updateBookingStatus);
  const loadBookingsFromSupabase = useBookingStore((s) => s.loadBookingsFromSupabase);

  // Tự động tải đơn đặt phòng mới nhất từ Supabase khi Admin vào màn hình
  useFocusEffect(
    useCallback(() => {
      loadBookingsFromSupabase();
    }, [loadBookingsFromSupabase])
  );

  // Thống kê phòng
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
  const fullRooms = rooms.filter((r) => r.status === 'full').length;

  // Thống kê slot & booking
  const totalSlots = rooms.reduce((sum, r) => sum + r.slots.length, 0);
  const bookedSlots = rooms.reduce(
    (sum, r) => sum + r.slots.filter((s) => s.isBooked).length,
    0
  );
  const occupancyRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  // Lọc lượt đặt gần nhất
  const recentBookings = bookings.slice(0, 4);

  const handleApprove = async (id: string, name: string) => {
    await updateBookingStatus(id, 'confirmed');
    Alert.alert('Thành công', `Đã duyệt đơn đặt phòng của ${name}`);
  };

  const handleReject = (id: string, name: string) => {
    Alert.alert(
      'Từ chối đặt phòng',
      `Bạn có chắc muốn từ chối yêu cầu của ${name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            await updateBookingStatus(id, 'cancelled', 'Phòng cần bảo trì đột xuất');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTag}>QUẢN TRỊ VIÊN VKU (WEB & APP)</Text>
              <Text style={styles.headerTitle}>{user?.name || 'Ban Quản trị Giảng đường'}</Text>
              <Text style={styles.headerSubtitle}>Mã số: {user?.studentId || 'VKU-ADM01'}</Text>
            </View>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi cổng Quản trị?', [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Đăng xuất', style: 'destructive', onPress: logout },
                ]);
              }}
            >
              <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
              <Text style={styles.switchButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Metrics Grid */}
        <View style={styles.metricGrid}>
          <View style={[styles.metricCard, { borderLeftColor: '#3B82F6' }]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Tổng số phòng</Text>
              <Ionicons name="business" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.metricValue}>{totalRooms}</Text>
            <Text style={styles.metricSub}>Khu A & Khu V</Text>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#10B981' }]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Sẵn sàng</Text>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={[styles.metricValue, { color: '#065F46' }]}>{availableRooms}</Text>
            <Text style={styles.metricSub}>Đang hoạt động</Text>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#F59E0B' }]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Bảo trì</Text>
              <Ionicons name="construct" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.metricValue, { color: '#92400E' }]}>{maintenanceRooms}</Text>
            <Text style={styles.metricSub}>Tạm ngưng phục vụ</Text>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#8B5CF6' }]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Tỷ lệ lấp đầy</Text>
              <Ionicons name="pie-chart" size={20} color="#8B5CF6" />
            </View>
            <Text style={[styles.metricValue, { color: '#5B21B6' }]}>{occupancyRate}%</Text>
            <Text style={styles.metricSub}>{bookedSlots}/{totalSlots} slots đặt</Text>
          </View>
        </View>

        {/* Quick Action Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THAO TÁC QUẢN TRỊ</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AdminRooms')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="cube" size={22} color="#1D4ED8" />
              </View>
              <Text style={styles.actionBtnText}>Quản lý Phòng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AdminBookings')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="receipt" size={22} color="#059669" />
              </View>
              <Text style={styles.actionBtnText}>Duyệt Đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AdminUsers')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="people" size={22} color="#D97706" />
              </View>
              <Text style={styles.actionBtnText}>Cấp User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AdminProfile')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="settings-sharp" size={22} color="#7E22CE" />
              </View>
              <Text style={styles.actionBtnText}>Cấu hình</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Bookings Queue */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={styles.sectionTitle}>YÊU CẦU ĐẶT PHÒNG GẦN ĐÂY</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminBookings')}>
              <Text style={styles.seeAllText}>Xem tất cả ({bookings.length})</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color="#9CA3AF" />
              <Text style={styles.emptyText}>Chưa có lượt đặt phòng nào</Text>
            </View>
          ) : (
            recentBookings.map((b) => (
              <View key={b.id} style={styles.bookingItemCard}>
                <View style={styles.bookingItemTop}>
                  <View style={styles.roomBadge}>
                    <Text style={styles.roomBadgeText}>{b.roomName}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      b.status === 'confirmed'
                        ? styles.statusConfirmed
                        : b.status === 'cancelled'
                        ? styles.statusCancelled
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        b.status === 'confirmed'
                          ? styles.statusConfirmedText
                          : b.status === 'cancelled'
                          ? styles.statusCancelledText
                          : styles.statusPendingText,
                      ]}
                    >
                      {b.status === 'confirmed'
                        ? 'Đã duyệt'
                        : b.status === 'cancelled'
                        ? 'Đã hủy'
                        : 'Chờ duyệt'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bookingStudentName}>
                  {b.studentName} ({b.studentId})
                </Text>
                <Text style={styles.bookingPurpose} numberOfLines={1}>
                  Mục đích: {b.purpose}
                </Text>

                {b.status === 'pending' && (
                  <View style={styles.bookingActionRow}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApprove(b.id, b.studentName)}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.approveBtnText}>Duyệt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleReject(b.id, b.studentName)}
                    >
                      <Ionicons name="close" size={16} color="#EF4444" />
                      <Text style={styles.rejectBtnText}>Từ chối</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Building Stats Overview */}
        <View style={[styles.section, { marginBottom: 30 }]}>
          <Text style={styles.sectionTitle}>PHÂN BỐ THEO KHU VỰC</Text>
          <View style={styles.buildingCard}>
            <View style={styles.buildingRow}>
              <View style={styles.buildingLeft}>
                <Ionicons name="location" size={20} color="#1E3A5F" />
                <Text style={styles.buildingName}>Khu V (Việt - Hàn)</Text>
              </View>
              <Text style={styles.buildingCount}>
                {rooms.filter((r) => r.building === 'Khu V').length} phòng
              </Text>
            </View>
            <View style={styles.buildingDivider} />
            <View style={styles.buildingRow}>
              <View style={styles.buildingLeft}>
                <Ionicons name="location" size={20} color="#1E3A5F" />
                <Text style={styles.buildingName}>Khu A (Hành chính & Học tập)</Text>
              </View>
              <Text style={styles.buildingCount}>
                {rooms.filter((r) => r.building === 'Khu A').length} phòng
              </Text>
            </View>
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
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: -16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#94A3B8',
  },
  bookingItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bookingItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusConfirmed: {
    backgroundColor: '#DEF7EC',
  },
  statusConfirmedText: {
    color: '#03543F',
    fontSize: 11,
    fontWeight: '700',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPendingText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  statusCancelled: {
    backgroundColor: '#FDE8E8',
  },
  statusCancelledText: {
    color: '#9B1C1C',
    fontSize: 11,
    fontWeight: '700',
  },
  bookingStudentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  bookingPurpose: {
    fontSize: 12,
    color: '#64748B',
  },
  bookingActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  buildingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  buildingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  buildingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buildingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  buildingCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  buildingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
});
