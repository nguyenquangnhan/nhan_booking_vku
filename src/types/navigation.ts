// src/types/navigation.ts
// Type-safe Navigation Params – Phase 2 & 3 (User & Admin)

import { StudyRoom, BookingOrder } from './index';

// ─── User Root Stack ──────────────────────────────────────────────────────────
export type RootStackParamList = {
  MainTabs: undefined;
  RoomDetail: { room: StudyRoom };
  BookingConfirm: { order: BookingOrder; room: StudyRoom };
};

// ─── User Bottom Tab ──────────────────────────────────────────────────────────
export type MainTabParamList = {
  Browse: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

// ─── Admin Bottom Tab ─────────────────────────────────────────────────────────
export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminRooms: undefined;
  AdminBookings: undefined;
  AdminUsers: undefined;
  AdminProfile: undefined;
};

// ─── Admin Root Stack ─────────────────────────────────────────────────────────
export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminRoomDetail: { room: StudyRoom };
};
