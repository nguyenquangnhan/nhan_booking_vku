import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StudyRoom, TimeSlot } from '../types';
import { supabase } from '../lib/supabase';
import { useRoomStore } from '../store/useRoomStore';

// Fetch rooms + slots của ngày hôm nay từ Supabase
export async function fetchRoomsFromSupabase(building?: string): Promise<StudyRoom[]> {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  let query = supabase.from('rooms').select('*');
  if (building && building !== 'all') {
    query = query.eq('building', building);
  }

  const { data: rooms, error: roomsError } = await query;
  if (roomsError) throw roomsError;
  if (!rooms || rooms.length === 0) return [];

  const roomIds = (rooms as any[]).map((r: any) => r.id as string);

  const { data: slots, error: slotsError } = await supabase
    .from('time_slots')
    .select('*')
    .in('room_id', roomIds)
    .eq('date', today);

  if (slotsError) throw slotsError;

  const allSlots = (slots ?? []) as any[];

  return (rooms as any[]).map((room: any): StudyRoom => ({
    id: room.id,
    name: room.name,
    building: room.building,
    floor: room.floor,
    capacity: room.capacity,
    imageUrl: room.image_url,
    facilities: room.facilities,
    status: room.status,
    slots: allSlots
      .filter((s: any) => s.room_id === room.id)
      .map((s: any): TimeSlot => ({
        id: s.id,
        startTime: (s.start_time as string).slice(0, 5),
        endTime: (s.end_time as string).slice(0, 5),
        isBooked: s.is_booked,
        bookedBy: s.booked_by ?? undefined,
      })),
  }));
}

// Main hook
export function useRooms(building?: string) {
  const localRooms = useRoomStore((s) => s.rooms);

  const query = useQuery<StudyRoom[]>({
    queryKey: ['rooms', { building }],
    queryFn: async () => {
      try {
        const remoteRooms = await fetchRoomsFromSupabase(building);
        if (remoteRooms.length > 0) {
          useRoomStore.getState().setRooms(remoteRooms);
          return remoteRooms;
        }
      } catch (err) {
        console.warn('[useRooms] Supabase fallback to local rooms:', err);
      }

      if (building && building !== 'all') {
        return useRoomStore.getState().rooms.filter((r) => r.building === building);
      }
      return useRoomStore.getState().rooms;
    },
    initialData: () => {
      if (building && building !== 'all') {
        return localRooms.filter((r) => r.building === building);
      }
      return localRooms;
    },
    staleTime: 5 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Dữ liệu phản ánh tức thì thay đổi của local store khi bookSlots / releaseSlots
  const reactiveData = useMemo(() => {
    let source = localRooms;
    if (building && building !== 'all') {
      source = source.filter((r) => r.building === building);
    }
    return source;
  }, [localRooms, building]);

  return {
    ...query,
    data: reactiveData,
  };
}
