// src/utils/formatTime.ts
// Tiện ích format thời gian hiển thị

/**
 * Hiển thị khung giờ dạng "07:00 – 09:00"
 */
export function formatSlotLabel(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

/**
 * Format ngày hiện tại dạng "Thứ Tư, 24/09/2026"
 */
export function formatDate(date: Date = new Date()): string {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${days[date.getDay()]}, ${d}/${m}/${y}`;
}

/**
 * Format ISO string thành "HH:mm - DD/MM/YYYY"
 */
export function formatCreatedAt(isoString: string): string {
  const date = new Date(isoString);
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const mo = (date.getMonth() + 1).toString().padStart(2, '0');
  const yy = date.getFullYear();
  return `${hh}:${mm} - ${dd}/${mo}/${yy}`;
}

/**
 * Tạo UUID đơn giản cho BookingOrder.id
 */
export function generateId(): string {
  return 'bk-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}
