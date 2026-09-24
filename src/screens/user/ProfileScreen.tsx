// src/screens/user/ProfileScreen.tsx
// Màn hình hồ sơ sinh viên – Phase 2

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, danger }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconText}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      <Text style={styles.menuChevron}>›</Text>
    </Pressable>
  );
}

export function ProfileScreen() {
  const allBookings = useBookingStore((s) => s.bookings);
  const clearUserBookings = useBookingStore((s) => s.clearUserBookings);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const currentUser = {
    name: user?.name || 'Nguyễn Văn An',
    studentId: user?.code || user?.studentId || 'VKU21SE001',
    email: user?.email || 'an.nguyen@student.vku.udn.vn',
    faculty: user?.department || 'Khoa Công nghệ Thông tin & Truyền thông',
    class: 'SE21A',
  };

  const userIdentifier = (
    user?.code ||
    user?.studentId ||
    user?.id ||
    ''
  ).toUpperCase();

  // Chỉ tính toán số liệu đặt phòng của chính sinh viên này
  const myBookings = React.useMemo(() => {
    if (!userIdentifier) return [];
    return allBookings.filter((b) => {
      const bStudentId = (b.studentId || '').toUpperCase();
      const bUserId = (b.userId || '').toUpperCase();
      return bStudentId === userIdentifier || bUserId === userIdentifier;
    });
  }, [allBookings, userIdentifier]);

  const handleClearHistory = () => {
    Alert.alert(
      'Xóa lịch sử đặt phòng của bạn',
      'Thao tác này chỉ xóa các đơn đặt phòng của tài khoản bạn và không ảnh hưởng đến sinh viên khác. Bạn có chắc?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa lịch sử của tôi',
          style: 'destructive',
          onPress: () => clearUserBookings(userIdentifier),
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi ứng dụng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A5F" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.heroName}>{currentUser.name}</Text>
          <Text style={styles.heroId}>{currentUser.studentId}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Sinh viên VKU</Text>
          </View>
        </Animated.View>

        {/* Stats row */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.statsRow}
        >
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myBookings.length}</Text>
            <Text style={styles.statLabel}>Đặt phòng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {new Set(myBookings.map((b) => b.roomId)).size}
            </Text>
            <Text style={styles.statLabel}>Phòng khác nhau</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {myBookings.reduce((sum, b) => sum + b.slotIds.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Slot đã dùng</Text>
          </View>
        </Animated.View>

        {/* Info section */}
        <Animated.View
          entering={FadeInDown.delay(180).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Thông tin sinh viên</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Email" value={currentUser.email} />
            <InfoRow label="Khoa" value={currentUser.faculty} />
            <InfoRow label="Lớp" value={currentUser.class} isLast />
          </View>
        </Animated.View>

        {/* Actions section */}
        <Animated.View
          entering={FadeInDown.delay(260).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Cài đặt tài khoản</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="🔔"
              title="Thông báo"
              subtitle="Nhận nhắc nhở trước 30 phút"
            />
            <MenuItem
              icon="📋"
              title="Về ứng dụng"
              subtitle="VKU Booking v1.0.0 (Phase 3)"
            />
            <MenuItem
              icon="🗑️"
              title="Xóa lịch sử đặt phòng"
              danger
              onPress={handleClearHistory}
            />
            <MenuItem
              icon="🚪"
              title="Đăng xuất"
              danger
              onPress={handleLogout}
            />
          </View>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  hero: {
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B5BAD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroId: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E3A5F',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 2,
    textAlign: 'right',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemPressed: {
    backgroundColor: '#F9FAFB',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  menuTitleDanger: {
    color: '#EF4444',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  menuChevron: {
    fontSize: 20,
    color: '#D1D5DB',
  },
});
