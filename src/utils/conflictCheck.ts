// src/utils/conflictCheck.ts
// Kiểm tra xung đột slot tại client-side

import { TimeSlot } from '../types';

/**
 * Kiểm tra xem một slot có khả dụng để đặt không
 */
export function isSlotAvailable(slot: TimeSlot): boolean {
  return !slot.isBooked;
}

/**
 * Lọc ra các slot đã chọn còn hợp lệ (chưa bị đặt bởi người khác)
 * Dùng khi realtime update làm một slot bị chiếm trong lúc user đang chọn
 */
export function filterValidSelectedSlots(
  selectedSlotIds: string[],
  slots: TimeSlot[]
): { valid: string[]; invalidated: string[] } {
  const valid: string[] = [];
  const invalidated: string[] = [];

  for (const slotId of selectedSlotIds) {
    const slot = slots.find((s) => s.id === slotId);
    if (slot && !slot.isBooked) {
      valid.push(slotId);
    } else {
      invalidated.push(slotId);
    }
  }

  return { valid, invalidated };
}

/**
 * Kiểm tra toàn bộ các slot đã chọn trước khi submit
 * Trả về true nếu tất cả còn hợp lệ, false nếu có xung đột
 */
export function validateBeforeBooking(
  selectedSlotIds: string[],
  slots: TimeSlot[]
): boolean {
  return selectedSlotIds.every((slotId) => {
    const slot = slots.find((s) => s.id === slotId);
    return slot != null && !slot.isBooked;
  });
}
