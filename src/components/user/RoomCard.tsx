// src/components/user/RoomCard.tsx
import React, { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { StudyRoom, FacilityKey } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

const FACILITY_ICONS: Record<FacilityKey, string> = {
  projector: '📽',
  pc:        '🖥',
  ac:        '❄️',
  whiteboard:'📝',
  outlet:    '🔌',
};

interface Props {
  room: StudyRoom;
  onPress: (room: StudyRoom) => void;
}

const RoomCardComponent: React.FC<Props> = ({ room, onPress }) => {
  const availableSlots = room.slots.filter((s) => !s.isBooked).length;
  const isAvailable = room.status === 'available';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && isAvailable && styles.cardPressed,
      ]}
      onPress={() => isAvailable && onPress(room)}
      accessibilityRole="button"
      accessibilityLabel={`Xem phòng ${room.name}`}
    >
      {/* Ảnh phòng */}
      <Image
        source={{ uri: room.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Nội dung */}
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
          <StatusBadge status={room.status} />
        </View>

        <Text style={styles.location}>
          📍 {room.building} · Tầng {room.floor}
        </Text>

        <Text style={styles.capacity}>
          👥 Sức chứa: {room.capacity} người
        </Text>

        {/* Slot còn trống */}
        <Text style={styles.slotsAvail}>
          🕐 {availableSlots}/5 ca còn trống hôm nay
        </Text>

        {/* Icons trang thiết bị */}
        <View style={styles.facilitiesRow}>
          {room.facilities.map((key) => (
            <Text key={key} style={styles.facilityIcon}>
              {FACILITY_ICONS[key]}
            </Text>
          ))}
        </View>

        {/* Nút đặt phòng */}
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            room.status !== 'available' && styles.btnDisabled,
            pressed && room.status === 'available' && styles.btnPressed,
          ]}
          onPress={() => onPress(room)}
          disabled={room.status !== 'available'}
          android_ripple={{ color: '#BFDBFE' }}
          accessibilityRole="button"
          accessibilityLabel={`Xem lịch và đặt phòng ${room.name}`}
        >
          <Text style={[styles.btnText, room.status !== 'available' && styles.btnTextDisabled]}>
            {room.status === 'maintenance' ? '🔧 Đang bảo trì' :
             room.status === 'full'        ? '⛔ Phòng đầy' :
                                             'Xem lịch / Đặt phòng →'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export const RoomCard = memo(RoomCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.96,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  body: {
    padding: 14,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  location: { fontSize: 13, color: '#6B7280' },
  capacity:  { fontSize: 13, color: '#6B7280' },
  slotsAvail:{ fontSize: 13, color: '#059669', fontWeight: '600' },
  facilitiesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  facilityIcon: { fontSize: 18 },
  btn: {
    marginTop: 10,
    backgroundColor: '#3B82F6',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#E5E7EB' },
  btnPressed:  { opacity: 0.8 },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnTextDisabled: { color: '#9CA3AF' },
});
