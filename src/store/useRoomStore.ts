// src/store/useRoomStore.ts
// Store quản lý danh sách phòng học và slot – hỗ trợ tương tác Admin & User

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyRoom, RoomStatus, TimeSlot } from '../types';
import { MOCK_ROOMS } from '../data/mockRooms';
import { supabase } from '../lib/supabase';

interface RoomState {
  rooms: StudyRoom[];
  setRooms: (rooms: StudyRoom[]) => void;
  addRoom: (room: StudyRoom) => Promise<void>;
  updateRoomStatus: (roomId: string, status: RoomStatus) => Promise<void>;
  toggleSlotAdminLock: (roomId: string, slotId: string) => Promise<void>;
  bookSlots: (roomId: string, slotIds: string[], studentId: string) => Promise<void>;
  releaseSlots: (roomId: string, slotIds: string[]) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  resetToMock: () => void;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rooms: MOCK_ROOMS,

      setRooms: (rooms) => set({ rooms }),

      addRoom: async (newRoom: StudyRoom) => {
        // Cập nhật local store trước
        set((state) => ({
          rooms: [newRoom, ...state.rooms],
        }));

        // Ghi lên Supabase nếu có kết nối
        try {
          await supabase.from('rooms').insert({
            id: newRoom.id,
            name: newRoom.name,
            building: newRoom.building,
            floor: newRoom.floor,
            capacity: newRoom.capacity,
            image_url: newRoom.imageUrl,
            facilities: newRoom.facilities,
            status: newRoom.status,
          } as never);
        } catch (e) {
          console.warn('[useRoomStore] Không thể ghi room lên Supabase:', e);
        }
      },

      updateRoomStatus: async (roomId: string, status: RoomStatus) => {
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, status } : r
          ),
        }));

        try {
          await supabase
            .from('rooms')
            .update({ status } as never)
            .eq('id', roomId);
        } catch (e) {
          console.warn('[useRoomStore] Lỗi update status lên Supabase:', e);
        }
      },

      bookSlots: async (roomId: string, slotIds: string[], studentId: string) => {
        set((state) => ({
          rooms: state.rooms.map((r) => {
            if (r.id !== roomId) return r;
            const updatedSlots = r.slots.map((s) => {
              if (slotIds.includes(s.id)) {
                return {
                  ...s,
                  isBooked: true,
                  bookedBy: studentId,
                };
              }
              return s;
            });
            return { ...r, slots: updatedSlots };
          }),
        }));

        try {
          if (slotIds.length > 0) {
            await supabase
              .from('time_slots')
              .update({
                is_booked: true,
                booked_by: studentId,
              } as never)
              .in('id', slotIds);
          }
        } catch (e) {
          console.warn('[useRoomStore] Lỗi cập nhật bookSlots lên Supabase:', e);
        }
      },

      releaseSlots: async (roomId: string, slotIds: string[]) => {
        set((state) => ({
          rooms: state.rooms.map((r) => {
            if (r.id !== roomId) return r;
            const updatedSlots = r.slots.map((s) => {
              if (slotIds.includes(s.id)) {
                return {
                  ...s,
                  isBooked: false,
                  bookedBy: undefined,
                };
              }
              return s;
            });
            return { ...r, slots: updatedSlots };
          }),
        }));

        try {
          if (slotIds.length > 0) {
            await supabase
              .from('time_slots')
              .update({
                is_booked: false,
                booked_by: null,
              } as never)
              .in('id', slotIds);
          }
        } catch (e) {
          console.warn('[useRoomStore] Lỗi releaseSlots lên Supabase:', e);
        }
      },

      toggleSlotAdminLock: async (roomId: string, slotId: string) => {
        set((state) => ({
          rooms: state.rooms.map((r) => {
            if (r.id !== roomId) return r;
            const updatedSlots = r.slots.map((s) => {
              if (s.id !== slotId) return s;
              const isLocked = s.bookedBy === 'ADMIN_LOCK';
              return {
                ...s,
                isBooked: !isLocked,
                bookedBy: isLocked ? undefined : 'ADMIN_LOCK',
              };
            });
            return { ...r, slots: updatedSlots };
          }),
        }));

        try {
          const room = get().rooms.find((r) => r.id === roomId);
          const slot = room?.slots.find((s) => s.id === slotId);
          if (slot) {
            await supabase
              .from('time_slots')
              .update({
                is_booked: slot.isBooked,
                booked_by: slot.bookedBy || null,
              } as never)
              .eq('id', slotId);
          }
        } catch (e) {
          console.warn('[useRoomStore] Lỗi cập nhật slot lên Supabase:', e);
        }
      },

      deleteRoom: async (roomId: string) => {
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== roomId),
        }));

        try {
          await supabase.from('rooms').delete().eq('id', roomId);
        } catch (e) {
          console.warn('[useRoomStore] Lỗi xoá phòng trên Supabase:', e);
        }
      },

      resetToMock: () => set({ rooms: MOCK_ROOMS }),
    }),
    {
      name: 'vku-rooms-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
