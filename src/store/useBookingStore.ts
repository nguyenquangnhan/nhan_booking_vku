// src/store/useBookingStore.ts
// Zustand Store quản lý đơn đặt phòng – hỗ trợ phân quyền User & Admin

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingOrder, BookingStatus } from '../types';
import { supabase } from '../lib/supabase';
import { useRoomStore } from './useRoomStore';

const INITIAL_BOOKINGS: BookingOrder[] = [
  {
    id: 'BKG-VKU-001',
    roomId: 'room-01',
    roomName: 'Lab 302',
    slotIds: ['room-01-s1'],
    userId: 'usr-sv-001',
    studentName: 'Nguyễn Văn An',
    studentId: 'VKU21SE001',
    purpose: 'Học nhóm Đồ án Đa nền tảng',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'confirmed',
  },
  {
    id: 'BKG-VKU-002',
    roomId: 'room-03',
    roomName: 'Phòng Tự Học K.A – 101',
    slotIds: ['room-03-s3'],
    userId: 'usr-sv-002',
    studentName: 'Lê Thị Mai',
    studentId: 'VKU22IT045',
    purpose: 'Ôn tập đồ án tốt nghiệp',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'pending',
  },
  {
    id: 'BKG-VKU-003',
    roomId: 'room-02',
    roomName: 'Lab 304',
    slotIds: ['room-02-s2', 'room-02-s3'],
    userId: 'usr-sv-003',
    studentName: 'Trần Quốc Bảo',
    studentId: 'VKU21AI012',
    purpose: 'Workshop CLB Lập trình AI',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'confirmed',
  },
];

interface BookingState {
  bookings: BookingOrder[];
  addBooking: (order: BookingOrder) => void;
  cancelBooking: (id: string, userCodeOrId?: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  loadBookingsFromSupabase: (userCodeOrId?: string) => Promise<void>;
  clearUserBookings: (userCodeOrId: string) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus, adminNote?: string) => void;
  clearAll: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: INITIAL_BOOKINGS,

      addBooking: (order) =>
        set((state) => {
          if (state.bookings.some((b) => b.id === order.id)) {
            return state;
          }
          return {
            bookings: [{ ...order, status: order.status || 'pending' }, ...state.bookings],
          };
        }),

      // Hủy 1 đơn đặt phòng: Nhả slot cho người khác đặt và đồng bộ Supabase
      cancelBooking: async (id: string, userCodeOrId?: string) => {
        const booking = get().bookings.find((b) => b.id === id);
        if (!booking) return;

        if (userCodeOrId) {
          const u = userCodeOrId.toUpperCase();
          const isOwner =
            (booking.userId && booking.userId.toUpperCase() === u) ||
            (booking.studentId && booking.studentId.toUpperCase() === u);
          if (!isOwner) return; // Không được hủy đơn của người khác
        }

        // 1. Cập nhật trạng thái đơn trong local store
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' } : b
          ),
        }));

        // 2. Nhả khung giờ trong RoomStore ngay lập tức để user khác đặt được
        if (booking.slotIds && booking.slotIds.length > 0) {
          useRoomStore.getState().releaseSlots(booking.roomId, booking.slotIds);
        }

        // 3. Đồng bộ cập nhật lên Supabase
        try {
          await supabase
            .from('bookings')
            .update({ status: 'cancelled' } as never)
            .eq('id', id);

          if (booking.slotIds && booking.slotIds.length > 0) {
            await supabase
              .from('time_slots')
              .update({
                is_booked: false,
                booked_by: null,
              } as never)
              .in('id', booking.slotIds);
          }
        } catch (e) {
          console.warn('[useBookingStore] Lỗi cập nhật hủy phòng lên Supabase:', e);
        }
      },

      // Xóa hoàn toàn 1 đơn đặt phòng khỏi danh sách
      deleteBooking: async (id: string) => {
        const booking = get().bookings.find((b) => b.id === id);
        if (!booking) return;

        // Nếu đơn chưa hủy, đảm bảo phải nhả slot trước khi xóa
        if (booking.status !== 'cancelled' && booking.slotIds && booking.slotIds.length > 0) {
          useRoomStore.getState().releaseSlots(booking.roomId, booking.slotIds);
        }

        // Xóa khỏi local store
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
        }));

        // Xóa trên Supabase
        try {
          await supabase.from('bookings').delete().eq('id', id);

          if (booking.status !== 'cancelled' && booking.slotIds && booking.slotIds.length > 0) {
            await supabase
              .from('time_slots')
              .update({
                is_booked: false,
                booked_by: null,
              } as never)
              .in('id', booking.slotIds);
          }
        } catch (e) {
          console.warn('[useBookingStore] Lỗi xóa booking trên Supabase:', e);
        }
      },

      // Tải danh sách đơn đặt phòng từ Supabase
      loadBookingsFromSupabase: async (userCodeOrId?: string) => {
        try {
          let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
          if (userCodeOrId) {
            query = query.or(`student_id.ilike.${userCodeOrId},user_id.ilike.${userCodeOrId}`);
          }
          const { data, error } = await query;
          if (!error && data) {
            const mapped: BookingOrder[] = data.map((b: any) => ({
              id: b.id,
              roomId: b.room_id,
              roomName: b.room_name || 'Phòng học',
              slotIds: b.slot_ids || [],
              userId: b.user_id,
              studentName: b.student_name,
              studentId: b.student_id,
              purpose: b.purpose || '',
              status: b.status || 'pending',
              createdAt: b.created_at || new Date().toISOString(),
              adminNote: b.admin_note,
            }));

            set((state) => {
              const remoteMap = new Map(mapped.map((m) => [m.id, m]));
              // Cập nhật các đơn đã có bằng thông tin mới nhất từ Supabase (status, adminNote...)
              const updatedExisting = state.bookings.map((b) => {
                const remote = remoteMap.get(b.id);
                return remote ? { ...b, ...remote } : b;
              });
              // Thêm các đơn mới từ Supabase chưa có ở local
              const existingIds = new Set(state.bookings.map((b) => b.id));
              const newFromRemote = mapped.filter((m) => !existingIds.has(m.id));
              return { bookings: [...newFromRemote, ...updatedExisting] };
            });
          }
        } catch (e) {
          console.warn('[useBookingStore] Lỗi load bookings từ Supabase:', e);
        }
      },

      // Xóa toàn bộ lịch sử CỦA RIÊNG USER ĐÓ (Không ảnh hưởng đến người khác!)
      clearUserBookings: async (userCodeOrId: string) => {
        if (!userCodeOrId) return;
        const u = userCodeOrId.toUpperCase();

        set((state) => ({
          bookings: state.bookings.filter((b) => {
            const isOwner =
              (b.userId && b.userId.toUpperCase() === u) ||
              (b.studentId && b.studentId.toUpperCase() === u);
            // Giữ lại tất cả đơn đặt phòng của người khác, chỉ loại bỏ đơn của user hiện tại
            return !isOwner;
          }),
        }));

        try {
          await supabase
            .from('bookings')
            .delete()
            .or(`student_id.ilike.${userCodeOrId},user_id.ilike.${userCodeOrId}`);
        } catch (e) {
          console.warn('[useBookingStore] Lỗi xóa booking user trên Supabase:', e);
        }
      },

      // Cập nhật trạng thái đơn (Duyệt / Từ chối / Hủy) – Đồng bộ Supabase và giải phóng/khóa slot
      updateBookingStatus: async (id: string, status: BookingStatus, adminNote?: string) => {
        const booking = get().bookings.find((b) => b.id === id);

        // 1. Cập nhật local store ngay lập tức
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status, ...(adminNote ? { adminNote } : {}) } : b
          ),
        }));

        // 2. Xử lý các slot tương ứng trong RoomStore
        if (booking && booking.slotIds && booking.slotIds.length > 0) {
          if (status === 'confirmed') {
            useRoomStore.getState().bookSlots(booking.roomId, booking.slotIds, booking.studentId);
          } else if (status === 'cancelled' || status === 'rejected') {
            useRoomStore.getState().releaseSlots(booking.roomId, booking.slotIds);
          }
        }

        // 3. Ghi lên Supabase
        try {
          const updatePayload: any = { status };
          if (adminNote) updatePayload.admin_note = adminNote;

          await supabase
            .from('bookings')
            .update(updatePayload as never)
            .eq('id', id);

          // Cập nhật time_slots trên Supabase
          if (booking && booking.slotIds && booking.slotIds.length > 0) {
            if (status === 'confirmed') {
              await supabase
                .from('time_slots')
                .update({ is_booked: true, booked_by: booking.studentId } as never)
                .in('id', booking.slotIds);
            } else if (status === 'cancelled' || status === 'rejected') {
              await supabase
                .from('time_slots')
                .update({ is_booked: false, booked_by: null } as never)
                .in('id', booking.slotIds);
            }
          }
        } catch (e) {
          console.warn('[useBookingStore] Lỗi cập nhật trạng thái đơn lên Supabase:', e);
        }
      },

      clearAll: () => set({ bookings: [] }),
    }),
    {
      name: 'vku-booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
