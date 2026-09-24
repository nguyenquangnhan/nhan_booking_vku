// src/hooks/useCreateBooking.ts
// TanStack Query mutation – ghi booking lên Supabase + cập nhật time_slots

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BookingOrder } from '../types';

interface CreateBookingInput {
  order: BookingOrder;
}

async function createBookingInSupabase(order: BookingOrder): Promise<void> {
  // 1. Ghi vào bảng bookings
  const { error: bookingError } = await supabase
    .from('bookings')
    .insert({
      id: order.id,
      room_id: order.roomId,
      room_name: order.roomName,
      slot_ids: order.slotIds,
      user_id: order.userId || 'usr-sv-001',
      student_name: order.studentName,
      student_id: order.studentId,
      purpose: order.purpose,
      status: order.status || 'pending',
    } as never);

  if (bookingError) throw bookingError;

  // 2. Đánh dấu các time_slots là đã đặt
  for (const slotId of order.slotIds) {
    await supabase
      .from('time_slots')
      .update({ is_booked: true, booked_by: order.studentId } as never)
      .eq('id', slotId);
  }
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ order }: CreateBookingInput) =>
      createBookingInSupabase(order),

    onSuccess: () => {
      // Invalidate cache để refetch slot mới nhất
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },

    onError: (err) => {
      console.error('[useCreateBooking] Lỗi ghi Supabase:', err);
      // Không crash app – Zustand local store đã lưu rồi
    },
  });
}
