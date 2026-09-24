// src/screens/user/HomeScreen.tsx
// Phase 3: Kết nối Supabase qua useRooms hook (TanStack Query)

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, FlatList, TextInput, Text, StyleSheet,
  SafeAreaView, StatusBar, ListRenderItem, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StudyRoom, FilterChipKey } from '../../types';
import { useRooms } from '../../hooks/useRooms';          // ← Supabase hook
import { filterRooms } from '../../utils/filterRooms';
import { RoomCard } from '../../components/user/RoomCard';
import { FilterChips } from '../../components/user/FilterChips';
import { EmptyState } from '../../components/shared/EmptyState';
import { formatDate } from '../../utils/formatTime';

interface Props {
  onSelectRoom: (room: StudyRoom) => void;
}

export const HomeScreen: React.FC<Props> = ({ onSelectRoom }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterChipKey[]>([]);

  // ─── Fetch từ Supabase (tự fallback về mock nếu lỗi) ─────────────────
  const { data: rooms = [], isLoading, isError, refetch } = useRooms();

  // Tự động làm mới dữ liệu khi người dùng chuyển về tab Trang chủ
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // ─── Filter cục bộ trên dữ liệu từ Supabase ───────────────────────────
  const filteredRooms = useMemo(
    () => filterRooms(rooms, searchQuery, activeFilters),
    [rooms, searchQuery, activeFilters]
  );

  const handleToggleFilter = useCallback((key: FilterChipKey) => {
    if (key === 'all') {
      setActiveFilters([]);
      return;
    }
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleClearFilter = useCallback(() => {
    setSearchQuery('');
    setActiveFilters([]);
  }, []);

  const renderItem: ListRenderItem<StudyRoom> = useCallback(
    ({ item }) => <RoomCard room={item} onPress={onSelectRoom} />,
    [onSelectRoom]
  );

  const keyExtractor = useCallback((item: StudyRoom) => item.id, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏫 VKU Booking</Text>
        <Text style={styles.headerDate}>{formatDate()}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍  Tìm phòng, tòa nhà..."
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Tìm kiếm phòng học"
        />
      </View>

      {/* Filter Chips */}
      <FilterChips activeFilters={activeFilters} onToggle={handleToggleFilter} />

      {/* Status bar: đang tải / lỗi / số phòng */}
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#1D4ED8" />
          <Text style={styles.loadingText}>Đang tải dữ liệu phòng...</Text>
        </View>
      ) : isError ? (
        <Text style={styles.errorText}>⚠️ Không thể tải dữ liệu – dùng dữ liệu nội bộ</Text>
      ) : (
        <Text style={styles.resultCount}>{filteredRooms.length} phòng tìm thấy</Text>
      )}

      {/* Room List – Pull-to-refresh gọi Supabase lại */}
      <FlatList
        data={filteredRooms}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? null : <EmptyState onClearFilter={handleClearFilter} />
        }
        contentContainerStyle={
          filteredRooms.length === 0 ? styles.listEmpty : styles.list
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1D4ED8' },
  headerDate:  { fontSize: 12, color: '#6B7280' },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 12,
    color: '#EF4444',
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F8FAFC',
  },
  list:      { paddingTop: 8, paddingBottom: 24 },
  listEmpty: { flex: 1 },
});
