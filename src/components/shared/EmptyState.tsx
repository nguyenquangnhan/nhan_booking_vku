// src/components/shared/EmptyState.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  onClearFilter: () => void;
}

export const EmptyState: React.FC<Props> = ({ onClearFilter }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>🔍</Text>
    <Text style={styles.title}>Không tìm thấy phòng phù hợp</Text>
    <Text style={styles.subtitle}>Thử thay đổi từ khóa hoặc bộ lọc</Text>
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      onPress={onClearFilter}
    >
      <Text style={styles.btnText}>Xóa bộ lọc</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  btn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnPressed: { opacity: 0.75 },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
