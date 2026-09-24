// src/components/shared/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoomStatus } from '../../types';

interface Props {
  status: RoomStatus;
}

const STATUS_CONFIG: Record<RoomStatus, { label: string; bg: string; text: string }> = {
  available:   { label: 'Sẵn sàng', bg: '#D1FAE5', text: '#065F46' },
  full:        { label: 'Đang bận', bg: '#FEE2E2', text: '#991B1B' },
  maintenance: { label: 'Bảo trì',  bg: '#F3F4F6', text: '#6B7280' },
};

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
