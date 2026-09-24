// src/components/user/FilterChips.tsx
// Nút lọc phòng học chuẩn giao diện iOS & Android – không bị co rút

import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { FilterChip, FilterChipKey } from '../../types';

const CHIPS: FilterChip[] = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'available', label: '🟢 Đang trống' },
  { key: 'projector', label: '📽 Máy chiếu' },
  { key: 'pc',        label: '🖥 Phòng Lab PC' },
  { key: 'ac',        label: '❄️ Điều hòa' },
  { key: 'outlet',    label: '🔌 Ổ cắm điện' },
];

interface Props {
  activeFilters: FilterChipKey[];
  onToggle: (key: FilterChipKey) => void;
}

export const FilterChips: React.FC<Props> = ({ activeFilters, onToggle }) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={styles.scroll}
      >
        {CHIPS.map((chip) => {
          const isActive =
            chip.key === 'all'
              ? activeFilters.length === 0 || activeFilters.includes('all')
              : activeFilters.includes(chip.key);

          return (
            <Pressable
              key={chip.key}
              style={({ pressed }) => [
                styles.chip,
                isActive && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => onToggle(chip.key)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={chip.label}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scroll: {
    height: 42,
  },
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    lineHeight: 18,
  },
  chipTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
});
