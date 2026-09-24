// src/screens/admin/AdminBookingListScreen.tsx
// Màn hình quản lý và duyệt toàn bộ đơn đặt phòng sinh viên VKU

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../../store/useBookingStore';
import { BookingOrder, BookingStatus } from '../../types';

export function AdminBookingListScreen() {
  const bookings = useBookingStore((s) => s.bookings);
  const updateBookingStatus = useBookingStore((s) => s.updateBookingStatus);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const loadBookingsFromSupabase = useBookingStore((s) => s.loadBookingsFromSupabase);

  const [selectedFilter, setSelectedFilter] = useState<'all' | BookingStatus>('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tự động tải đơn đặt phòng mới nhất từ Supabase khi vào màn hình
  useFocusEffect(
    useCallback(() => {
      loadBookingsFromSupabase();
    }, [loadBookingsFromSupabase])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBookingsFromSupabase();
    setIsRefreshing(false);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const currentStatus = b.status || 'confirmed';
      const matchStatus = selectedFilter === 'all' || currentStatus === selectedFilter;
      const matchSearch =
        search.trim() === '' ||
        b.studentName.toLowerCase().includes(search.toLowerCase()) ||
        b.studentId.toLowerCase().includes(search.toLowerCase()) ||
        b.roomName.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [bookings, selectedFilter, search]);

  const handleApprove = async (item: BookingOrder) => {
    await updateBookingStatus(item.id, 'confirmed');
    Alert.alert('Thành công', `Đã duyệt yêu cầu đặt phòng của ${item.studentName}`);
  };

  const handleRejectPrompt = (item: BookingOrder) => {
    Alert.prompt
      ? Alert.prompt(
          'Từ chối đặt phòng',
          `Nhập lý do từ chối gửi tới sinh viên ${item.studentName}:`,
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Xác nhận từ chối',
              style: 'destructive',
              onPress: async (reason?: string) => {
                await updateBookingStatus(
                  item.id,
                  'cancelled',
                  reason || 'Phòng học bận lịch sự kiện cấp trường'
                );
              },
            },
          ]
        )
      : Alert.alert(
          'Từ chối đặt phòng',
          `Bạn có chắc chắn muốn từ chối yêu cầu của ${item.studentName}?`,
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Từ chối',
              style: 'destructive',
              onPress: async () => {
                await updateBookingStatus(
                  item.id,
                  'cancelled',
                  'Phòng học bận lịch sự kiện cấp trường'
                );
              },
            },
          ]
        );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Duyệt & Quản lý Đặt phòng</Text>
        <Text style={styles.headerSub}>
          {bookings.length} lượt đặt phòng được ghi nhận trong hệ thống
        </Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo MSSV, tên SV, phòng..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'pending', label: 'Chờ duyệt' },
            { key: 'confirmed', label: 'Đã duyệt' },
            { key: 'cancelled', label: 'Đã hủy' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.pill,
                selectedFilter === f.key && styles.pillActive,
              ]}
              onPress={() => setSelectedFilter(f.key as any)}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedFilter === f.key && styles.pillTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Không tìm thấy đơn đặt phòng nào</Text>
            <Text style={styles.emptySub}>
              Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = item.status || 'confirmed';

          return (
            <View style={styles.card}>
              {/* Header card */}
              <View style={styles.cardTop}>
                <View style={styles.roomTag}>
                  <Ionicons name="business" size={14} color="#1D4ED8" />
                  <Text style={styles.roomTagText}>{item.roomName}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    status === 'confirmed'
                      ? styles.statusConfirmed
                      : status === 'cancelled'
                      ? styles.statusCancelled
                      : styles.statusPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      status === 'confirmed'
                        ? styles.statusConfirmedText
                        : status === 'cancelled'
                        ? styles.statusCancelledText
                        : styles.statusPendingText,
                    ]}
                  >
                    {status === 'confirmed'
                      ? 'ĐÃ DUYỆT'
                      : status === 'cancelled'
                      ? 'ĐÃ HỦY'
                      : 'CHỜ DUYỆT'}
                  </Text>
                </View>
              </View>

              {/* Student info */}
              <View style={styles.studentSection}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.studentId}>MSSV: {item.studentId}</Text>
              </View>

              {/* Booking details */}
              <View style={styles.detailBox}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Khung giờ:</Text>
                  <Text style={styles.detailValue}>
                    {item.slotIds.length} khung giờ đã chọn
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="flag-outline" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Mục đích:</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {item.purpose}
                  </Text>
                </View>

                {item.adminNote && (
                  <View style={styles.adminNoteRow}>
                    <Ionicons name="information-circle" size={16} color="#DC2626" />
                    <Text style={styles.adminNoteText}>
                      Ghi chú BQL: {item.adminNote}
                    </Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.cardActions}>
                {status === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApprove(item)}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.approveBtnText}>Duyệt đặt phòng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleRejectPrompt(item)}
                    >
                      <Ionicons name="close-circle" size={16} color="#DC2626" />
                      <Text style={styles.rejectBtnText}>Từ chối</Text>
                    </TouchableOpacity>
                  </>
                )}

                {status === 'confirmed' && (
                  <TouchableOpacity
                    style={styles.cancelActionBtn}
                    onPress={() => handleRejectPrompt(item)}
                  >
                    <Ionicons name="close-outline" size={16} color="#EF4444" />
                    <Text style={styles.cancelActionBtnText}>Hủy lịch này</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: '#38BDF8',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pillTextActive: {
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusConfirmed: {
    backgroundColor: '#DEF7EC',
  },
  statusConfirmedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#03543F',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPendingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  statusCancelled: {
    backgroundColor: '#FDE8E8',
  },
  statusCancelledText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9B1C1C',
  },
  studentSection: {
    marginBottom: 10,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
  },
  adminNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  adminNoteText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 9,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 9,
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingVertical: 8,
  },
  cancelActionBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
