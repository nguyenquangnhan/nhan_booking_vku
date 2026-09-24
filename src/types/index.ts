// src/types/index.ts
// TypeScript Interfaces theo PRD mục 4.3

export interface Facility {
  id: string;
  name: string;
  icon: string;
}

export type FacilityKey = 'projector' | 'pc' | 'ac' | 'whiteboard' | 'outlet';

export type SlotStatus = 'available' | 'selected' | 'booked' | 'admin_lock';

export interface TimeSlot {
  id: string;
  startTime: string;   // e.g. "07:00"
  endTime: string;     // e.g. "09:00"
  isBooked: boolean;
  bookedBy?: string;   // Student ID hoặc "ADMIN_LOCK"
}

export type RoomStatus = 'available' | 'full' | 'maintenance';

export interface StudyRoom {
  id: string;
  name: string;
  building: string;       // "Khu A", "Khu V"
  floor: number;
  capacity: number;
  imageUrl: string;
  facilities: FacilityKey[];  // ["projector", "pc", "ac", "whiteboard"]
  status: RoomStatus;
  slots: TimeSlot[];
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'rejected';

export interface BookingOrder {
  id: string;
  roomId: string;
  roomName: string;
  slotIds: string[];
  userId?: string;
  studentName: string;
  studentId: string;
  purpose: string;
  createdAt: string;  // ISO string
  status?: BookingStatus;
  adminNote?: string;
  reviewedBy?: string;
}

export type UserRole = 'user' | 'admin' | 'student';

export interface AppUser {
  id: string;
  name: string;
  studentId: string;
  code?: string;
  role: UserRole;
  email?: string;
  department?: string;
  password?: string;
}

// Filter types
export type FilterChipKey =
  | 'all'
  | 'projector'
  | 'pc'
  | 'ac'
  | 'outlet'
  | 'available';

export interface FilterChip {
  key: FilterChipKey;
  label: string;
}
