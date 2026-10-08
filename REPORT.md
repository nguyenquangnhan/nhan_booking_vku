# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** VKU Booking – Real-time Study Room Booking & Facility Management App  
**Team / Student Name:** Nguyễn Quang Nhân  
**Submission Date:** 24/09/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Nguyễn Quang Nhân — Student ID: 23IT191 — Role: Fullstack Mobile Developer (Architecture, UI/UX, State Management & Cloud DB) — Contribution: [100%]
* **🔗 Live Demo URL:** [Expo Go Dev Server / Localhost `http://localhost:8081` via `npx expo start`]
* **💻 GitHub Repository:** https://github.com/nguyenquangnhan/nhan_booking_vku
* **📦 Android Standalone APK:** `VKUBooking-v1.0.0.apk` (Release Standalone, đóng gói sẵn Hermes bundle & native binaries)
* **🎥 Video Demo (Optional):** [https://drive.google.com/drive/folders/1MnlFD2C8D_qKxFkrW9xJUfptrW-3ycYu?usp=drive_link]

---

## 2. FEATURE IMPLEMENTATION CHECKLIST
| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | **Phân quyền Đa cổng (Role-Based Access Control - RBAC)** | ✅ Complete | Phân tách 2 cổng chuyên biệt: Cổng Sinh viên (`VKU21SE001` / `sv123456`) và Cổng Quản trị viên (`VKU-ADM01` / `admin123`) với giao diện Admin Dark Theme riêng biệt. |
| 2 | **Tìm kiếm & Bộ lọc Đa tiêu chí (Multi-parameter Filtering)** | ✅ Complete | Tìm kiếm theo tên phòng/tòa nhà (Khu A, Khu V). Lọc tổ hợp đồng thời (AND logic): Điều hòa, Máy chiếu, Phòng Lab PC, Ổ cắm, Phòng đang trống. |
| 3 | **Cơ chế Chống trùng lịch (Zero Double-Booking)** | ✅ Complete | Quy trình bảo vệ 4 tầng: Vô hiệu hóa nút theo trạng thái `isBooked`, thuật toán `conflictCheck.ts` trước khi gửi, cập nhật atomic lên Supabase và nhả slot tức thì khi hủy phòng. |
| 4 | **Lưu trữ Cục bộ & Khả năng Hoạt động Offline (Local Persistence)** | ✅ Complete | Quản lý state toàn cục bằng **Zustand** kết hợp middleware `persist` lưu vào `@react-native-async-storage/async-storage`, dữ liệu luôn khả dụng ngay cả khi mất mạng. |
| 5 | **Đồng bộ Cơ sở Dữ liệu Đám mây (Supabase Cloud Sync)** | ✅ Complete | Tích hợp Supabase Client (`@supabase/supabase-js`) và `@tanstack/react-query` đồng bộ hai chiều cho các bảng `rooms`, `time_slots`, `bookings`, `users`. |
| 6 | **Quản trị Giảng đường & Cấp tài khoản (Admin Suite)** | ✅ Complete | Admin Dashboard thống kê tỷ lệ lấp đầy ca học, duyệt/từ chối đơn toàn trường kèm lý do, tính năng **Admin Lock** khóa ca sự kiện và cấp mới tài khoản sinh viên. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE
* **Cấu trúc thư mục:** Thiết kế theo kiến trúc phân tầng rõ ràng (Layered / Feature-based Architecture):
  * `src/screens/`: Phân tách rành mạch thành `auth/` (LoginScreen), `user/` (Home, RoomDetail, BookingConfirm, MyBookings, Profile), và `admin/` (Dashboard, Rooms, Bookings, Users, Profile).
  * `src/navigation/`: Quản lý điều hướng với **React Navigation v7** gồm `RootNavigator` (điều hướng xác thực), `UserNavigator` (Bottom Tabs Sinh viên), `AdminNavigator` (Bottom Tabs Quản trị Dark Theme).
  * `src/store/`: 4 store Zustand độc lập (`useAuthStore`, `useRoomStore`, `useBookingStore`, `useUserStore`) được cấu hình lưu đệm qua `AsyncStorage`.
  * `src/lib/` & `src/utils/`: Cấu hình Supabase client (`src/lib/supabase.ts`), thuật toán kiểm tra xung đột trùng lịch (`conflictCheck.ts`), bộ lọc kết hợp (`filterRooms.ts`).
* **Luồng quản lý State & Đồng bộ:**
  * Client gọi Hook TanStack Query (`useRooms`) nạp dữ liệu từ Cloud Supabase. Nếu truy vấn thành công, dữ liệu lập tức cập nhật vào Zustand Store.
  * Khi người dùng đặt hoặc hủy phòng, ứng dụng áp dụng kỹ thuật **Optimistic Update**: cập nhật trạng thái UI và Zustand Store tức thì để mang lại trải nghiệm 60 FPS, đồng thời bất đồng bộ gửi truy vấn ghi lên Cloud Supabase.
* **Chiến lược xử lý ngoại lệ (Exception Handling):**
  * Tất cả các thao tác mạng (Network Requests) đều được bao bọc trong khối `try/catch`. Khi Supabase mất kết nối hoặc RLS bị từ chối, ứng dụng tự động **Fallback về Mock Data và Local Store** an toàn mà không làm sập ứng dụng (Graceful Degradation).

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS
* **Hình 1 - Màn hình Đăng nhập Đa cổng (`LoginScreen`):** Giao diện chuyển đổi linh hoạt giữa Cổng Sinh viên và Cổng Quản trị viên, hỗ trợ tự động điền và xác thực bảo mật.
* **Hình 2 - Tìm kiếm & Lọc phòng học (`HomeScreen`):** Giao diện danh sách phòng học trực quan với các Filter Chips (Máy chiếu, Điều hòa, Lab PC...) kèm trạng thái khả dụng.
* **Hình 3 - Chọn Ca giờ & Chống trùng lịch (`RoomDetailScreen`):** Lưới ma trận các ca học trong ngày (`07:00–09:00`, `09:00–11:00`...); các ca đã bị người khác đặt hoặc bị Admin Lock sẽ tự động chuyển sang màu xám/đỏ và khóa tương tác.
* **Hình 4 - Admin Dashboard & Phê duyệt đơn (`AdminDashboardScreen` & `AdminBookingListScreen`):** Bảng điều khiển quản trị thống kê KPI phòng học và danh sách đơn đặt phòng toàn trường kèm nút Duyệt / Từ chối theo thời gian thực.

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS
* **Thách thức 1: Bài toán ngăn chặn trùng lịch (Double-Booking) khi nhiều sinh viên cùng đặt một ca học.**
  * *Giải pháp:* Xây dựng cơ chế phòng vệ 4 lớp. Tại tầng Client, vô hiệu hóa ngay nút chọn slot nếu `isBooked = true`. Trước khi gửi đơn, hàm `conflictCheck.ts` quét lại mảng `slotIds`. Tại tầng lưu trữ, sử dụng lệnh cập nhật nguyên tử (Atomic Update) `.in('id', slotIds)` của Supabase kết hợp cập nhật đồng thời lên Zustand Store để đồng bộ ngay lập tức cho toàn bộ giao diện.
* **Thách thức 2: Trải nghiệm người dùng mượt mà khi kết nối mạng chập chờn (Offline-first Capability).**
  * *Giải pháp:* Tích hợp middleware `persist` của Zustand cùng thư viện `@react-native-async-storage/async-storage` và cơ chế stale-time của TanStack Query. Ứng dụng luôn ưu tiên nạp dữ liệu từ bộ nhớ đệm cục bộ giúp màn hình hiển thị tức thì (Zero-loading latency), sau đó âm thầm đồng bộ ngầm với Cloud Supabase.
