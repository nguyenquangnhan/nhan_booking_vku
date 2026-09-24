// src/components/user/TimeSlotGrid.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { TimeSlot } from '../../types';
import { formatSlotLabel } from '../../utils/formatTime';

interface Props {
  slots: TimeSlot[];
  selectedSlotIds: string[];
  onToggleSlot: (slotId: string) => void;
}

export const TimeSlotGrid: React.FC<Props> = ({ slots, selectedSlotIds, onToggleSlot }) => {
  const handlePress = (slot: TimeSlot) => {
    if (slot.isBooked) {
      Alert.alert(
        'Khung giờ đã bị đặt',
        'Khung giờ này đã có người đặt. Vui lòng chọn khung giờ khác.',
        [{ text: 'OK' }]
      );
      return;
    }
    onToggleSlot(slot.id);
  };

  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const isSelected = selectedSlotIds.includes(slot.id);
        const isBooked = slot.isBooked;

        return (
          <Pressable
            key={slot.id}
            style={({ pressed }) => [
              styles.cell,
              isBooked   && styles.cellBooked,
              isSelected && styles.cellSelected,
              pressed && !isBooked && styles.cellPressed,
            ]}
            onPress={() => handlePress(slot)}
            disabled={false} // cho phép bấm vào slot đã đặt để hiển thị Alert
            accessibilityRole="button"
            accessibilityLabel={`Khung giờ ${formatSlotLabel(slot.startTime, slot.endTime)}, ${
              isBooked ? 'đã được đặt' : isSelected ? 'đang chọn' : 'còn trống'
            }`}
          >
            <Text style={[styles.slotTime, isSelected && styles.slotTimeSelected, isBooked && styles.slotTimeBooked]}>
              {formatSlotLabel(slot.startTime, slot.endTime)}
            </Text>

            <Text style={[styles.slotStatus, isSelected && styles.slotStatusSelected, isBooked && styles.slotStatusBooked]}>
              {isBooked ? '🔒 Đã đặt' : isSelected ? '✓ Đang chọn' : 'Còn trống'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },
  cell: {
    width: '47%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 4,
  },
  cellBooked: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  cellSelected: {
    borderColor: '#1D4ED8',
    backgroundColor: '#1D4ED8',
  },
  cellPressed: { opacity: 0.75 },
  slotTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  slotTimeSelected: { color: '#fff' },
  slotTimeBooked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  slotStatus: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  slotStatusSelected: { color: '#BFDBFE' },
  slotStatusBooked: { color: '#9CA3AF' },
});
