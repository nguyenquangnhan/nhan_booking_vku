# 🏫 VKU Booking – Real-time Study Room Booking App
> **Ứng dụng di động đa nền tảng đặt phòng học & quản lý cơ sở vật chất thông minh dành cho Giảng viên & Sinh viên Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU).**

---

## 📖 Mục lục
1. [Giới thiệu dự án](#1-giới-thiệu-dự-án)
2. [Tính năng nổi bật](#2-tính-năng-nổi-bật)
3. [Công nghệ sử dụng](#3-công-nghệ-sử-dụng)
4. [Tài khoản đăng nhập thử nghiệm](#4-tài-khoản-đăng-nhập-thử-nghiệm)
5. [Hướng dẫn cài đặt & Khởi chạy](#5-hướng-dẫn-cài-đặt--khởi-chạy)
6. [Hướng dẫn sử dụng chi tiết](#6-hướng-dẫn-sử-dụng-chi-tiết)
   - [Dành cho Sinh viên](#61-dành-cho-sinh-viên-user-portal)
   - [Dành cho Cán bộ Quản trị](#62-dành-cho-cán-bộ-quản-trị-admin-portal)
7. [Cấu trúc mã nguồn](#7-cấu-trúc-mã-nguồn)
8. [Cơ chế Chống trùng lịch & Đồng bộ Dữ liệu](#8-cơ-chế-chống-trùng-lịch--đồng-bộ-dữ-liệu)

---

## 1. Giới thiệu dự án

Việc tra cứu và mượn phòng tự học, phòng thực hành máy tính (Lab) tại các trường đại học thường gặp phải các vấn đề:
* Mất thời gian di chuyển tìm kiếm phòng trống thủ công.
* Dễ xảy ra tình trạng **trùng lịch (double-booking)** giữa các nhóm sinh viên.
* Không nắm rõ thông tin trang thiết bị (máy chiếu, máy tính, điều hòa...).

**VKU Booking** giải quyết triệt để bài toán trên bằng cách cung cấp ứng dụng di động thời gian thực với trải nghiệm cuộn mượt mà 60 FPS, hệ thống bộ lọc trực quan, cơ chế phân quyền độc lập giữa Sinh viên và Ban Quản lý, cùng khả năng khóa / nhả khung giờ tự động lên Cloud Database.

---

## 2. Tính năng nổi bật

* ⚡ **Bộ lọc đa tiêu chí (Multi-parameter Filtering)**: Lọc đồng thời theo Điều hòa, Máy chiếu, PC Lab, Ổ cắm điện hoặc Phòng đang trống.
* 🛡️ **Chống trùng lịch tức thì (Zero Double-Booking)**: Vô hiệu hóa ca giờ đã bị đặt, kiểm tra xung đột trước khi gửi và giải phóng slot ngay khi hủy phòng.
* 🔄 **Đồng bộ đám mây Supabase + Offline-first**: Kết hợp Cloud Database Supabase và lưu trữ đệm Zustand + AsyncStorage, đảm bảo app luôn hoạt động mượt mà kể cả khi mạng chập chờn.
* 👥 **Phân quyền chuyên biệt (RBAC)**:
  * **Sinh viên**: Tìm kiếm phòng, chọn ca giờ trong ngày, xác nhận đặt phòng, quản lý lịch sử đặt, hủy đơn & nhả slot.
  * **Quản trị viên**: Dashboard thống kê KPI, duyệt/từ chối đơn toàn trường kèm ghi chú, thêm phòng học, khóa slot thủ công (Admin Lock), cấp và quản lý tài khoản sinh viên.
* 📱 **Trải nghiệm di động tối ưu**: Hỗ trợ cử chỉ vuốt để thao tác, kéo xuống làm mới (Pull-to-refresh), tự động cập nhật khi chuyển tab (Focus Effect).

---

## 3. Công nghệ sử dụng

* **Core**: [React Native 0.86](https://reactnative.dev/) & [Expo SDK 57](https://expo.dev/)
* **Ngôn ngữ**: TypeScript
* **Điều hướng (Routing)**: [React Navigation v7](https://reactnavigation.org/) (`NativeStackNavigator` + `BottomTabNavigator`)
* **Quản lý trạng thái (State)**: [Zustand](https://github.com/pmndrs/zustand) + Middleware `persist`
* **Lưu trữ cục bộ**: `@react-native-async-storage/async-storage`
* **Đám mây & Realtime DB**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
* **Xử lý bất đồng bộ & Cache**: `@tanstack/react-query`
* **Hoạt ảnh & Cử chỉ**: `react-native-reanimated` & `react-native-gesture-handler`

---

## 4. Tài khoản đăng nhập thử nghiệm

Ứng dụng hỗ trợ kiểm tra tài khoản từ Supabase hoặc đăng nhập nhanh bằng tài khoản thử nghiệm sau:

| Phân hệ | Tên đăng nhập (Mã / Email) | Mật khẩu mặc định | Ghi chú quyền hạn |
| :--- | :--- | :--- | :--- |
| 🎓 **Cổng Sinh viên** | `VKU21SE001`<br>*(hoặc `an.nguyen@student.vku.udn.vn`)* | `sv123456` | Sinh viên đặt phòng, xem lịch cá nhân, hủy đơn và nhả slot |
| 🛡️ **Cổng Quản trị (Admin)** | `VKU-ADM01`<br>*(hoặc `admin@vku.udn.vn`)* | `admin123` | Cán bộ quản lý: Duyệt đơn, khóa slot, thêm phòng, cấp tài khoản |

---

## 5. Hướng dẫn cài đặt & Khởi chạy

### 5.1. Yêu cầu môi trường
* Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 hoặc 20 LTS trở lên).
* Điện thoại có cài ứng dụng **Expo Go** (tải miễn phí trên App Store / Google Play).

### 5.2. Các bước khởi chạy

1. **Clone hoặc mở thư mục dự án**:
   ```bash
   cd d:/HocTap/N4/DA_NEN_TANG/ReactNative
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

3. **Khởi chạy máy chủ phát triển (Expo Dev Server)**:
   ```bash
   npx expo start
   ```

4. **Trải nghiệm ứng dụng**:
   * **Trên điện thoại Android / iOS**: Mở ứng dụng **Expo Go** và quét mã QR hiển thị trên Terminal.
   * **Trên trình duyệt Web**: Nhấn phím `w` trong cửa sổ dòng lệnh.
   * **Trên máy ảo Android**: Nhấn phím `a`.
   * **Trên máy ảo iOS (macOS)**: Nhấn phím `i`.

---

## 6. Hướng dẫn sử dụng chi tiết

### 6.1. Dành cho Sinh viên (User Portal)

#### Bước 1: Đăng nhập
1. Tại màn hình đăng nhập, chọn tab **"🎓 Cổng Sinh viên"**.
2. Nhập Mã sinh viên (`VKU21SE001`) và Mật khẩu (`sv123456`).
3. Nhấn **"Đăng nhập Sinh viên"**.

#### Bước 2: Tìm kiếm & Lọc phòng học
1. Vào tab **"Tìm phòng"** (màn hình chính).
2. Nhập tên phòng vào thanh tìm kiếm (VD: `Lab 302`, `Phòng Tự Học`) hoặc tên tòa nhà (`Khu A`, `Khu V`).
3. Bấm chọn các chip lọc tiện nghi (`Có máy chiếu`, `Phòng Lab PC`, `Điều hòa`, `Ổ cắm điện`, `Đang trống`). Có thể chọn nhiều chip cùng lúc (Logic AND).
4. Nhấn vào phòng bạn muốn đặt để xem chi tiết.

#### Bước 3: Đặt phòng & Khung giờ
1. Xem thông tin sức chứa, trang thiết bị và bảng ca giờ trong ngày:
   * **Ca 1**: `07:00 – 09:00`
   * **Ca 2**: `09:00 – 11:00`
   * **Ca 3**: `13:00 – 15:00`
   * **Ca 4**: `15:00 – 17:00`
   * **Ca 5**: `18:00 – 20:00`
2. Nhấp chọn 1 hoặc nhiều ca học màu trắng (ca sẽ chuyển sang màu xanh đậm có dấu `✓`).
3. Nhập mục đích sử dụng (VD: *"Học nhóm làm đồ án Đa nền tảng"*).
4. Bấm **"✅ Xác nhận đặt phòng"**.
5. Màn hình xác nhận thành công hiện ra:
   * Nhấn **"🏠 Xác nhận (Về trang chủ)"** để quay lại màn hình chính.
   * Hoặc nhấn **"📅 Xem lịch đặt phòng"** để kiểm tra đơn.

#### Bước 4: Quản lý & Hủy đặt phòng / Nhả slot
1. Chuyển sang tab **"Lịch đặt"**:
   * Xem danh sách các đơn đã đặt, phân loại theo 3 tab: **Tất cả**, **Đang đặt**, **Đã hủy**.
2. **Hủy phòng**: Nhấn nút **`🗑️ Hủy phòng & Nhả slot`** (hoặc vuốt thẻ sang trái) ➔ Chọn xác nhận hủy.
   * Đơn sẽ chuyển sang tab **Đã hủy**.
   * Khung giờ tương ứng sẽ được **nhả ra ngay lập tức** trong database để người khác có thể đặt được.
3. **Xóa vĩnh viễn đơn**: Với các đơn đã hủy, nhấn nút **`❌ Xóa khỏi danh sách`** để xóa sạch khỏi lịch sử.
4. **Làm mới dữ liệu**: Vuốt màn hình từ trên xuống (Pull-to-refresh) hoặc bấm icon làm mới ở góc phải header.

---

### 6.2. Dành cho Cán bộ Quản trị (Admin Portal)

#### Bước 1: Đăng nhập Quản trị
1. Đăng xuất tài khoản Sinh viên (vào tab **Hồ sơ** ➔ **Đăng xuất**).
2. Tại màn hình đăng nhập, chọn tab **"🛡️ Cổng Quản trị"**.
3. Nhập Mã cán bộ: `VKU-ADM01`, Mật khẩu: `admin123`.
4. Nhấn **"Đăng nhập Quản trị"**.

#### Bước 2: Theo dõi Tổng quan & Duyệt nhanh (Tab "Tổng quan")
* Theo dõi thống kê thời gian thực: Tổng số phòng, phòng trống, phòng bảo trì, tỷ lệ lấp đầy ca học (%).
* Xem danh sách yêu cầu mới gửi lên: Nhấn **"Duyệt"** (đơn chuyển thành `confirmed`) hoặc **"Từ chối"** kèm lý do.

#### Bước 3: Duyệt / Từ chối đơn toàn trường (Tab "Đặt phòng")
1. Vào tab **"Đặt phòng"**: Danh sách toàn bộ đơn đăng ký mượn phòng của sinh viên toàn trường được hiển thị.
2. Tìm kiếm sinh viên theo tên, MSSV hoặc tên phòng.
3. Lọc theo trạng thái (*Chờ duyệt*, *Đã duyệt*, *Đã hủy/Từ chối*).
4. Nhấn **`Duyệt`** ➔ Trạng thái đơn được lưu lên Supabase, sinh viên đăng nhập lại sẽ thấy ngay huy hiệu màu xanh lá **Đã duyệt**.
5. Nhấn **`Từ chối`** ➔ Nhập lý do (VD: *"Phòng bận phục vụ thi kết thúc học phần"*) ➔ Khung giờ tự động được nhả lại.

#### Bước 4: Quản lý phòng & Khóa slot sự kiện (Tab "Phòng học")
* **Thêm phòng mới**: Nhấn nút **"+ Thêm phòng"**, điền tên phòng, tòa nhà, tầng, sức chứa, chọn các thiết bị đi kèm.
* **Thay đổi trạng thái phòng**: Chuyển đổi linh hoạt giữa *Sẵn sàng*, *Đang bận*, *Bảo trì*.
* **Khóa ca giờ sự kiện (Admin Lock)**: Bấm vào ca giờ bất kỳ của phòng để khóa thủ công (ca chuyển sang màu đỏ `ADMIN_LOCK`). Khi đó sinh viên sẽ không thể đặt ca này. Bấm lại để mở khóa.
* **Xóa phòng**: Bấm icon thùng rác để gỡ bỏ phòng khỏi hệ thống.

#### Bước 5: Cấp & Quản lý tài khoản Sinh viên (Tab "Cấp tài khoản")
* **Cấp tài khoản mới**: Nhấn **"+ Cấp tài khoản mới"**, điền Họ tên, MSSV, Email VKU, Khoa và Mật khẩu khởi tạo. Tài khoản sẽ được đồng bộ lên bảng `users` trên Supabase.
* **Đổi / Reset mật khẩu**: Cập nhật mật khẩu mới cho sinh viên khi bị quên.
* **Xóa tài khoản**: Xóa sinh viên khỏi cơ sở dữ liệu khi tốt nghiệp hoặc thôi học.

---

## 7. Cấu trúc mã nguồn

```
ReactNative/
├── App.tsx                    # Entry point: GestureHandler + TanStack Query + RootNavigator
├── app.json                   # Cấu hình Expo và siêu dữ liệu ứng dụng
├── package.json               # Danh sách thư viện và dependencies
├── tsconfig.json              # Cấu hình TypeScript compiler
└── src/
    ├── components/
    │   ├── shared/            # Component dùng chung (StatusBadge, EmptyState)
    │   └── user/              # Component đặt phòng (RoomCard, TimeSlotGrid, BookingForm, FilterChips)
    ├── data/
    │   └── mockRooms.ts       # Dữ liệu phòng học mẫu khu A & khu V
    ├── hooks/
    │   ├── useRooms.ts        # Hook lấy danh sách phòng phản ánh reactive từ store và Supabase
    │   └── useCreateBooking.ts# Hook xử lý tạo đơn và đồng bộ slot
    ├── lib/
    │   └── supabase.ts        # Cấu hình kết nối Supabase Cloud Client
    ├── navigation/
    │   ├── RootNavigator.tsx  # Router gốc: Rẽ nhánh Đăng nhập, Sinh viên, Quản trị
    │   ├── UserNavigator.tsx  # Bottom Tabs & Stack dành cho Sinh viên
    │   └── AdminNavigator.tsx # Bottom Tabs Dark Theme dành cho Quản trị viên
    ├── screens/
    │   ├── auth/              # Màn hình đăng nhập đa cổng (LoginScreen)
    │   ├── user/              # Màn hình sinh viên (Home, RoomDetail, Confirm, MyBookings, Profile)
    │   └── admin/             # Màn hình admin (Dashboard, Rooms, Bookings, Users, Profile)
    ├── store/
    │   ├── useAuthStore.ts    # Quản lý phiên đăng nhập và phân quyền RBAC
    │   ├── useBookingStore.ts # Quản lý đơn, hủy phòng, nhả slot và đồng bộ Supabase
    │   ├── useRoomStore.ts    # Quản lý phòng học, bookSlots, releaseSlots, admin lock
    │   └── useUserStore.ts    # Quản lý danh sách tài khoản sinh viên do Admin cấp
    ├── types/
    │   ├── index.ts           # Định nghĩa Type / Interface chính (StudyRoom, BookingOrder, AppUser...)
    │   ├── database.ts        # Type tương ứng với bảng Database Supabase
    │   └── navigation.ts      # Type an toàn cho React Navigation ParamList
    └── utils/
        ├── conflictCheck.ts   # Thuật toán kiểm tra xung đột trùng lặp ca giờ
        ├── filterRooms.ts     # Bộ lọc phòng đa tiêu chí kết hợp logic AND
        └── formatTime.ts      # Hàm tiện ích format ngày giờ và tạo ID đơn
```

---

## 8. Cơ chế Chống trùng lịch & Đồng bộ Dữ liệu

Quy trình bảo toàn tính toàn vẹn dữ liệu đặt phòng được vận hành theo 4 lớp:

```
[Layer 1: Real-time UI] ──► Vô hiệu hóa nút bấm đối với ca giờ có isBooked = true hoặc ADMIN_LOCK
         │
[Layer 2: Pre-submit Check] ──► Chạy conflictCheck.ts kiểm tra mảng slotIds ngay trước khi bấm gửi
         │
[Layer 3: Store & Cloud Write] ──► Cập nhật Zustand đồng thời gửi Atomic Update (.in('id', slotIds)) lên Supabase
         │
[Layer 4: Optimistic Rollback] ──► Tự động nhả slot khi hủy phòng và cập nhật ngay lập tức cho các client khác
```

---

## 9. Hỗ trợ & Đóng góp

* **Môn học**: Phát triển ứng dụng Đa nền tảng (DA_NEN_TANG)
* **Đơn vị**: Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU) – Đại học Đà Nẵng
* **Bản quyền**: © 2026 VKU Cross-Platform Mobile Engineering Team. All rights reserved.
