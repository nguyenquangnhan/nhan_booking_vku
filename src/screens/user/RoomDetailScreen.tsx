// src/screens/user/RoomDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, Pressable,
  StyleSheet, SafeAreaView, Alert, StatusBar,
} from 'react-native';
import { StudyRoom, BookingOrder, FacilityKey } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { TimeSlotGrid } from '../../components/user/TimeSlotGrid';
import { BookingForm } from '../../components/user/BookingForm';
import { validateBeforeBooking } from '../../utils/conflictCheck';
import { generateId, formatDate } from '../../utils/formatTime';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useCreateBooking } from '../../hooks/useCreateBooking';

const FACILITY_LABELS: Record<FacilityKey, string> = {
  projector: '📽 Máy chiếu',
  pc:        '🖥 Máy tính',
  ac:        '❄️ Điều hòa',
  whiteboard:'📝 Bảng trắng',
  outlet:    '🔌 Ổ cắm điện',
};

interface Props {
  room: StudyRoom;
  onBack: () => void;
  onConfirm: (order: BookingOrder) => void;
}

export const RoomDetailScreen: React.FC<Props> = ({ room, onBack, onConfirm }) => {
  const currentUser = useAuthStore((s) => s.user);
  const liveRooms = useRoomStore((s) => s.rooms);
  const bookSlots = useRoomStore((s) => s.bookSlots);
  const addBooking = useBookingStore((s) => s.addBooking);
  const { mutate: createBooking } = useCreateBooking();

  // Lấy dữ liệu phòng mới nhất từ store
  const activeRoom = liveRooms.find((r) => r.id === room.id) || room;

  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    studentName: currentUser?.name || '',
    studentId: currentUser?.code || currentUser?.studentId || '',
    purpose: '',
  });

  const isFormValid =
    selectedSlotIds.length > 0 &&
    form.studentName.trim().length > 0 &&
    form.studentId.trim().length > 0 &&
    form.purpose.trim().length > 0;

  const handleToggleSlot = useCallback((slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  }, []);

  const handleFormChange = useCallback(
    (field: keyof typeof form, value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleConfirm = () => {
    if (isSubmitting) return;

    // Kiểm tra xung đột lần cuối tại client
    if (!validateBeforeBooking(selectedSlotIds, activeRoom.slots)) {
      Alert.alert(
        '⚠️ Xung đột lịch',
        'Một hoặc nhiều khung giờ đã bị người khác đặt. Vui lòng chọn lại.',
        [{ text: 'Chọn lại', onPress: () => setSelectedSlotIds([]) }]
      );
      return;
    }

    setIsSubmitting(true);

    const order: BookingOrder = {
      id: generateId(),
      roomId: activeRoom.id,
      roomName: activeRoom.name,
      slotIds: selectedSlotIds,
      userId: currentUser?.id,
      studentName: form.studentName.trim() || currentUser?.name || 'Sinh viên',
      studentId: form.studentId.trim() || currentUser?.code || currentUser?.studentId || 'VKU',
      purpose: form.purpose.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // 1. Lưu ngay vào Zustand store
    addBooking(order);

    // 2. Đánh dấu ca giờ đã được đặt trong room store
    bookSlots(activeRoom.id, selectedSlotIds, order.studentId);

    // 3. Ghi lên Supabase
    createBooking({ order });

    // 4. Xóa lựa chọn & reset trạng thái nhập
    setSelectedSlotIds([]);
    setForm((prev) => ({ ...prev, purpose: '' }));
    setIsSubmitting(false);

    // 5. Chuyển sang màn hình xác nhận
    onConfirm(order);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Quay lại">
          <Text style={styles.backText}>← Quay lại</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{room.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Ảnh phòng */}
        <Image source={{ uri: room.imageUrl }} style={styles.image} resizeMode="cover" />

        {/* Thông tin phòng */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoName}>{room.name}</Text>
            <StatusBadge status={room.status} />
          </View>
          <Text style={styles.infoSub}>📍 {room.building} · Tầng {room.floor}</Text>
          <Text style={styles.infoSub}>👥 Sức chứa: {room.capacity} người</Text>
          <Text style={styles.infoSub}>📅 {formatDate()}</Text>

          {/* Trang thiết bị */}
          <View style={styles.facilityWrap}>
            {room.facilities.map((key) => (
              <View key={key} style={styles.facilityTag}>
                <Text style={styles.facilityText}>{FACILITY_LABELS[key]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Chọn khung giờ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chọn khung giờ{' '}
            {selectedSlotIds.length > 0 && (
              <Text style={styles.selectedCount}>({selectedSlotIds.length} đã chọn)</Text>
            )}
          </Text>
          <TimeSlotGrid
            slots={activeRoom.slots}
            selectedSlotIds={selectedSlotIds}
            onToggleSlot={handleToggleSlot}
          />
        </View>

        {/* Form thông tin */}
        <View style={styles.section}>
          <BookingForm form={form} onChange={handleFormChange} />
        </View>

        {/* Nút xác nhận */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.confirmBtn,
              (!isFormValid || isSubmitting) && styles.confirmBtnDisabled,
              pressed && isFormValid && !isSubmitting && styles.confirmBtnPressed,
            ]}
            onPress={handleConfirm}
            disabled={!isFormValid || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Xác nhận đặt phòng"
          >
            <Text style={[styles.confirmText, (!isFormValid || isSubmitting) && styles.confirmTextDisabled]}>
              {isSubmitting
                ? '⏳  Đang lưu đặt phòng...'
                : isFormValid
                ? '✅  Xác nhận đặt phòng'
                : 'Chọn khung giờ & nhập thông tin'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: '#3B82F6', fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  scroll: { paddingBottom: 40 },
  image: { width: '100%', height: 200, backgroundColor: '#E5E7EB' },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  infoName: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1, marginRight: 8 },
  infoSub:  { fontSize: 13, color: '#6B7280' },
  facilityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  facilityTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  facilityText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600' },
  section: {
    marginTop: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
  },
  selectedCount: { color: '#3B82F6', fontWeight: '700' },
  footer: { paddingHorizontal: 16, paddingTop: 24 },
  confirmBtn: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#E5E7EB' },
  confirmBtnPressed:  { opacity: 0.85 },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  confirmTextDisabled: { color: '#9CA3AF' },
});
