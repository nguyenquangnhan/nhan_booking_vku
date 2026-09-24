// src/screens/user/BookingConfirmScreen.tsx
import React, { useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet,
  SafeAreaView, ScrollView, StatusBar,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BookingOrder, StudyRoom } from '../../types';
import { formatSlotLabel, formatCreatedAt } from '../../utils/formatTime';
import { useBookingStore } from '../../store/useBookingStore';
import { useCreateBooking } from '../../hooks/useCreateBooking';

interface Props {
  order: BookingOrder;
  room: StudyRoom;
  navigation?: any;
  onBookAgain: () => void;
}

export const BookingConfirmScreen: React.FC<Props> = ({ order, room, navigation, onBookAgain }) => {
  const bookings = useBookingStore((s) => s.bookings);
  const addBooking = useBookingStore((s) => s.addBooking);
  const { mutate: createBooking } = useCreateBooking();

  // Lưu vào Zustand (local persist) + Supabase (remote) nếu chưa được lưu
  useEffect(() => {
    const isAlreadySaved = bookings.some((b) => b.id === order.id);
    if (!isAlreadySaved) {
      addBooking(order);
      createBooking({ order });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lấy thông tin slot đã đặt
  const bookedSlots = room.slots.filter((s) => order.slotIds.includes(s.id));

  const handleGoHome = () => {
    if (navigation?.reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      onBookAgain();
    }
  };

  const handleGoBookings = () => {
    if (navigation?.reset) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            state: {
              routes: [{ name: 'MyBookings' }],
              index: 0,
            },
          },
        ],
      });
    } else if (navigation?.navigate) {
      navigation.navigate('MainTabs', { screen: 'MyBookings' });
    } else {
      onBookAgain();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Success icon with animation */}
        <Animated.View entering={FadeInDown.springify()} style={styles.successBox}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Đặt phòng thành công!</Text>
          <Text style={styles.successSub}>Mã đặt phòng của bạn</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{order.id}</Text>
          </View>
        </Animated.View>


        {/* Chi tiết đặt phòng */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Chi tiết đặt phòng</Text>

          <Row label="Phòng"        value={order.roomName} />
          <Row label="Vị trí"       value={`${room.building} · Tầng ${room.floor}`} />
          <Row label="Sinh viên"    value={order.studentName} />
          <Row label="MSSV"         value={order.studentId} />
          <Row label="Mục đích"     value={order.purpose} />
          <Row label="Thời gian đặt" value={formatCreatedAt(order.createdAt)} />

          {/* Danh sách slot đã đặt */}
          <View style={styles.divider} />
          <Text style={styles.slotHeader}>Khung giờ đã đặt:</Text>
          {bookedSlots.map((slot) => (
            <View key={slot.id} style={styles.slotItem}>
              <Text style={styles.slotDot}>✅</Text>
              <Text style={styles.slotText}>
                {formatSlotLabel(slot.startTime, slot.endTime)}
              </Text>
            </View>
          ))}
        </View>

        {/* Hướng dẫn */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            💡 Vui lòng đến đúng giờ. Nếu bạn không sử dụng phòng, hãy hủy đặt để nhường cho người khác.
          </Text>
        </View>

        {/* Nút hành động */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.85 }]}
            onPress={handleGoHome}
            accessibilityRole="button"
            accessibilityLabel="Xác nhận về trang chủ"
          >
            <Text style={styles.btnPrimaryText}>🏠 Xác nhận (Về trang chủ)</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnSecondary, pressed && { opacity: 0.85 }]}
            onPress={handleGoBookings}
            accessibilityRole="button"
            accessibilityLabel="Xem lịch đặt phòng"
          >
            <Text style={styles.btnSecondaryText}>📅 Xem lịch đặt phòng</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={rowStyles.value}>{value}</Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  label: { fontSize: 13, color: '#6B7280', flex: 1 },
  value: { fontSize: 13, fontWeight: '600', color: '#111827', flex: 2, textAlign: 'right' },
});

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  successBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  successIcon:  { fontSize: 56 },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#065F46' },
  successSub:   { fontSize: 13, color: '#6B7280' },
  codeBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  codeText: { fontSize: 16, fontWeight: '800', color: '#1D4ED8', letterSpacing: 1.5 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  divider:    { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  slotHeader: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  slotItem:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  slotDot:    { fontSize: 14 },
  slotText:   { fontSize: 14, fontWeight: '600', color: '#065F46' },
  noteBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noteText: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  actions: { gap: 12, marginTop: 4 },
  btnPrimary: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondaryText: { color: '#1E293B', fontWeight: '700', fontSize: 15 },
});
