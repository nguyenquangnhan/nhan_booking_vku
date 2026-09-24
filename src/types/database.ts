// src/types/database.ts
// TypeScript types tương ứng với schema Supabase
// Tạo bảng bằng SQL trong Supabase Dashboard

export type RoomStatus = 'available' | 'full' | 'maintenance';
export type UserRole = 'student' | 'admin';

// ─── Bảng rooms ───────────────────────────────────────────────────────────────
export interface DbRoom {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  image_url: string;
  facilities: string[];       // ['projector', 'pc', 'ac']
  status: RoomStatus;
  created_at: string;
}

// ─── Bảng time_slots ──────────────────────────────────────────────────────────
export interface DbTimeSlot {
  id: string;
  room_id: string;
  date: string;               // 'YYYY-MM-DD'
  start_time: string;         // '07:00'
  end_time: string;           // '09:00'
  is_booked: boolean;
  booked_by: string | null;   // student_id hoặc 'ADMIN_LOCK'
}

// ─── Bảng bookings ────────────────────────────────────────────────────────────
export interface DbBooking {
  id: string;
  room_id: string;
  slot_ids: string[];
  student_name: string;
  student_id: string;
  purpose: string;
  created_at: string;
}

// ─── Bảng users ───────────────────────────────────────────────────────────────
export interface DbUser {
  id: string;
  name: string;
  student_id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// ─── Database type cho createClient<Database>() ───────────────────────────────
export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: DbRoom;
        Insert: Omit<DbRoom, 'created_at'>;
        Update: Partial<Omit<DbRoom, 'id' | 'created_at'>>;
      };
      time_slots: {
        Row: DbTimeSlot;
        Insert: Omit<DbTimeSlot, 'id'>;
        Update: Partial<Omit<DbTimeSlot, 'id' | 'room_id'>>;
      };
      bookings: {
        Row: DbBooking;
        Insert: Omit<DbBooking, 'created_at'>;
        Update: Partial<Omit<DbBooking, 'id' | 'created_at'>>;
      };
      users: {
        Row: DbUser;
        Insert: Omit<DbUser, 'created_at'>;
        Update: Partial<Omit<DbUser, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      room_status: RoomStatus;
      user_role: UserRole;
    };
  };
}
