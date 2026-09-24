// src/utils/filterRooms.ts
// Logic lọc phòng theo AND filter (tất cả điều kiện phải thỏa)

import { StudyRoom, FilterChipKey } from '../types';

/**
 * Chuẩn hóa chuỗi để so sánh không phân biệt dấu & hoa/thường
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Lọc danh sách phòng theo từ khóa tìm kiếm VÀ các filter chips (Logic AND)
 */
export function filterRooms(
  rooms: StudyRoom[],
  searchQuery: string,
  activeFilters: FilterChipKey[]
): StudyRoom[] {
  const query = normalize(searchQuery.trim());

  return rooms.filter((room) => {
    // --- 1. Search query filter ---
    if (query) {
      const nameMatch = normalize(room.name).includes(query);
      const buildingMatch = normalize(room.building).includes(query);
      if (!nameMatch && !buildingMatch) return false;
    }

    // --- 2. Chip filters (AND logic) ---
    const chips = activeFilters.filter((c) => c !== 'all');

    for (const chip of chips) {
      switch (chip) {
        case 'projector':
          if (!room.facilities.includes('projector')) return false;
          break;
        case 'pc':
          if (!room.facilities.includes('pc')) return false;
          break;
        case 'ac':
          if (!room.facilities.includes('ac')) return false;
          break;
        case 'outlet':
          if (!room.facilities.includes('outlet')) return false;
          break;
        case 'available':
          if (room.status !== 'available') return false;
          break;
      }
    }

    return true;
  });
}
