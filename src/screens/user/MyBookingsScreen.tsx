// src/screens/user/MyBookingsScreen.tsx
// Màn hình lịch sử đặt phòng – Hỗ trợ Hủy phòng, Nhả slot và Xóa đơn trực tiếp

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutLeft,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { BookingOrder } from '../../types';

const SWIPE_THRESHOLD = -100;

type FilterTab = 'all' | 'active' | 'cancelled';

// ─── Booking Card Component ───────────────────────────────────────────────────
interface BookingCardProps {
  item: BookingOrder;
  index: number;
  onCancel: (id: string, roomName: string) => void;
  onDelete: (id: string, roomName: string) => void;
}

function BookingCard({ item, index, onCancel, onDelete }: BookingCardProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const resetSwipe = () => {
    translateX.value = withSpring(0);
  };

  const handleCancelAction = () => {
    resetSwipe();
    onCancel(item.id, item.roomName);
  };

  const handleDeleteAction = () => {
    resetSwipe();
    onDelete(item.id, item.roomName);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -140);
      }
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-140);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const deleteHintStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? withSpring(1) : withSpring(0),
  }));

  const date = new Date(item.createdAt);
  const dateStr = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const isCancelled = item.status === 'cancelled';
  const isConfirmed = item.status === 'confirmed';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      exiting={FadeOutLeft.duration(200)}
      layout={Layout.springify()}
      style={styles.cardWrapper}
    >
      {/* Nút hành động phía sau khi vuốt trái */}
      <Animated.View style={[styles.deleteHint, deleteHintStyle]}>
        <TouchableOpacity
          style={styles.hintButton}
          onPress={isCancelled ? handleDeleteAction : handleCancelAction}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isCancelled ? 'trash-outline' : 'close-circle-outline'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.deleteHintText}>{isCancelled ? 'Xóa' : 'Hủy'}</Text>
        </TouchableOpacity>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, isCancelled && styles.cardCancelled, cardStyle]}>
          {/* Card Header: Mã đặt phòng, Trạng thái, Ngày đặt */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.bookingIdBadge, isCancelled && styles.idBadgeCancelled]}>
                <Text style={[styles.bookingIdText, isCancelled && styles.idTextCancelled]}>
                  #{item.id.slice(-6).toUpperCase()}
                </Text>
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  isCancelled
                    ? styles.statusCancelled
                    : isConfirmed
                    ? styles.statusConfirmed
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isCancelled
                      ? styles.statusTextCancelled
                      : isConfirmed
                      ? styles.statusTextConfirmed
                      : styles.statusTextPending,
                  ]}
                >
                  {isCancelled ? 'Đã hủy' : isConfirmed ? 'Đã duyệt' : 'Chờ duyệt'}
                </Text>
              </View>
            </View>

            <Text style={styles.dateText}>{dateStr}</Text>
          </View>

          {/* Tên phòng & Mục đích */}
          <View style={styles.cardBody}>
            <Text style={[styles.roomName, isCancelled && styles.textMuted]}>
              {item.roomName}
            </Text>
            <Text style={styles.purposeText} numberOfLines={1}>
              🎯 {item.purpose || 'Học tập'}
            </Text>
            <View style={styles.slotsRow}>
              <Text style={styles.slotsLabel}>Khung giờ: </Text>
              <Text style={[styles.slotsCount, isCancelled && styles.textMuted]}>
                {item.slotIds.length} ca đã đăng ký
              </Text>
            </View>
          </View>

          {/* Card Footer: Các nút thao tác trực tiếp */}
          <View style={styles.cardFooter}>
            {isCancelled ? (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDeleteAction}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
                <Text style={styles.deleteBtnText}>Xóa khỏi danh sách</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancelAction}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
                <Text style={styles.cancelBtnText}>Hủy phòng & Nhả slot</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.swipeHint}>← Vuốt để thao tác</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function MyBookingsScreen() {
  const allBookings = useBookingStore((s) => s.bookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const deleteBooking = useBookingStore((s) => s.deleteBooking);
  const loadBookingsFromSupabase = useBookingStore((s) => s.loadBookingsFromSupabase);
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userIdentifier = (
    currentUser?.code ||
    currentUser?.studentId ||
    currentUser?.id ||
    ''
  ).toUpperCase();

  // Tự động tải lại danh sách khi vào màn hình
  useFocusEffect(
    useCallback(() => {
      if (userIdentifier) {
        loadBookingsFromSupabase(userIdentifier);
      }
    }, [loadBookingsFromSupabase, userIdentifier])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (userIdentifier) {
      await loadBookingsFromSupabase(userIdentifier);
    }
    setIsRefreshing(false);
  };

  // Đơn đặt phòng của riêng user hiện tại
  const myBookings = useMemo(() => {
    if (!userIdentifier) return [];
    return allBookings.filter((b) => {
      const bStudentId = (b.studentId || '').toUpperCase();
      const bUserId = (b.userId || '').toUpperCase();
      return bStudentId === userIdentifier || bUserId === userIdentifier;
    });
  }, [allBookings, userIdentifier]);

  // Lọc theo Tab đã chọn
  const filteredBookings = useMemo(() => {
    if (activeTab === 'active') {
      return myBookings.filter((b) => b.status !== 'cancelled');
    }
    if (activeTab === 'cancelled') {
      return myBookings.filter((b) => b.status === 'cancelled');
    }
    return myBookings;
  }, [myBookings, activeTab]);

  // Đếm số lượng theo trạng thái
  const counts = useMemo(() => {
    const active = myBookings.filter((b) => b.status !== 'cancelled').length;
    const cancelled = myBookings.filter((b) => b.status === 'cancelled').length;
    return { all: myBookings.length, active, cancelled };
  }, [myBookings]);

  // Xử lý HỦY phòng (chuyển sang cancelled và nhả slot cho người khác)
  const handleCancel = useCallback(
    (id: string, roomName: string) => {
      Alert.alert(
        'Xác nhận hủy đặt phòng',
        `Bạn có chắc chắn muốn hủy đặt phòng ${roomName}?\n\nKhung giờ này sẽ lập tức được nhả ra để sinh viên khác có thể đặt phòng.`,
        [
          { text: 'Giữ lại', style: 'cancel' },
          {
            text: 'Hủy phòng ngay',
            style: 'destructive',
            onPress: async () => {
              await cancelBooking(id, userIdentifier);
              Alert.alert('Thành công', `Đã hủy đặt phòng ${roomName}. Khung giờ đã được mở lại.`);
            },
          },
        ]
      );
    },
    [cancelBooking, userIdentifier]
  );

  // Xử lý XÓA hẳn đơn khỏi danh sách
  const handleDelete = useCallback(
    (id: string, roomName: string) => {
      Alert.alert(
        'Xóa đơn đặt phòng',
        `Xóa vĩnh viễn lịch đặt phòng ${roomName} khỏi lịch sử của bạn?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa vĩnh viễn',
            style: 'destructive',
            onPress: async () => {
              await deleteBooking(id);
            },
          },
        ]
      );
    },
    [deleteBooking]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: BookingOrder; index: number }) => (
      <BookingCard
        item={item}
        index={index}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    ),
    [handleCancel, handleDelete]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>
        {activeTab === 'cancelled'
          ? 'Không có đơn đặt phòng nào bị hủy'
          : activeTab === 'active'
          ? 'Bạn không có phòng nào đang đặt'
          : 'Chưa có đặt phòng nào'}
      </Text>
      <Text style={styles.emptySubtitle}>
        Tìm và chọn phòng học phù hợp tại tab "Tìm phòng"
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A5F" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Lịch đặt phòng của tôi</Text>
          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {counts.active} phòng đang đặt • {counts.cancelled} đã hủy
        </Text>

        {/* Tab Filters */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              Tất cả ({counts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Đang đặt ({counts.active})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'cancelled' && styles.tabButtonActive]}
            onPress={() => setActiveTab('cancelled')}
          >
            <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
              Đã hủy ({counts.cancelled})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  refreshIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 4,
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  tabTextActive: {
    color: '#1E3A5F',
    fontWeight: '700',
  },
  list: {
    padding: 14,
    paddingBottom: 32,
    flexGrow: 1,
  },
  cardWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  deleteHint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 140,
    backgroundColor: '#EF4444',
    borderRadius: 14,
  },
  hintButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteHintText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardCancelled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingIdBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  idBadgeCancelled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  bookingIdText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
    fontFamily: 'monospace',
  },
  idTextCancelled: {
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextConfirmed: {
    color: '#15803D',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextCancelled: {
    color: '#DC2626',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  cardBody: {
    gap: 4,
    marginBottom: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  textMuted: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  purposeText: {
    fontSize: 13,
    color: '#4B5563',
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  slotsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  swipeHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
