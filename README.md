# 🛠️ FixNow - Nền Tảng Đặt Lịch Sửa Chữa Chuyên Nghiệp

![FixNow Banner](https://img.shields.io/badge/FixNow-Professional%20Repair%20Service-blue?style=for-the-badge&logo=reactnative)
![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**FixNow** là một giải pháp công nghệ toàn diện giúp kết nối người dùng có nhu cầu sửa chữa (điện máy, đồ gia dụng, v.v.) với các kỹ thuật viên chuyên nghiệp một cách nhanh chóng, minh bạch và an toàn.

---

## 🌟 Tổng Quan Hệ Thống

Hệ thống FixNow được xây dựng với kiến trúc hiện đại, tập trung vào trải nghiệm người dùng trên thiết bị di động (Mobile-first) và một backend mạnh mẽ, bảo mật. Dự án cung cấp quy trình khép kín từ lúc tìm kiếm dịch vụ, đặt lịch, theo dõi tiến độ đến khi thanh toán và đánh giá.

### Điểm nổi bật:
- **Tốc độ:** Tìm kiếm và kết nối kỹ thuật viên chỉ trong vài thao tác.
- **Minh bạch:** Công khai giá cả, quy trình và đánh giá từ cộng đồng.
- **Hiện đại:** Giao diện mượt mà, hỗ trợ cả Android và iOS thông qua Expo.

---

## 🚀 Tech Stack

Dự án sử dụng các công nghệ tiên tiến nhất để đảm bảo hiệu suất và khả năng mở rộng:

### **Frontend (Mobile App)**
- **Framework:** [React Native](https://reactnative.dev/) (Managed by [Expo](https://expo.dev/))
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (Link-based routing)
- **State Management:** React Context API & Hooks
- **Styling:** Custom Vanilla CSS-in-JS & Expo Linear Gradient
- **Networking:** [Axios](https://axios-http.com/)
- **Animations:** React Native Reanimated & Haptics

### **Backend (Microservices Ready)**
- **Core:** [Spring Boot 3.4.0](https://spring.io/projects/spring-boot)
- **Security:** [Spring Security](https://spring.io/projects/spring-security) & [JWT (JSON Web Tokens)](https://jwt.io/)
- **Database:** [MySQL](https://www.mysql.com/)
- **ORM:** Spring Data JPA (Hibernate)
- **Storage:** [Cloudinary API](https://cloudinary.com/) (Quản lý hình ảnh dịch vụ/người dùng)
- **Tools:** Lombok, Maven, Validation API

---

## 👥 Vai Trò Người Dùng

| Vai trò | Chức năng chính |
| :--- | :--- |
| **Khách hàng (Customer)** | Đăng ký/đăng nhập, tìm kiếm thợ, đặt lịch, quản lý đơn hàng, đánh giá dịch vụ. |
| **Kỹ thuật viên (Technician)** | Quản lý thông tin cửa hàng, danh sách dịch vụ, tiếp nhận/từ chối đơn hàng, cập nhật trạng thái sửa chữa. |
| **Quản trị viên (Admin)** | Quản lý người dùng, duyệt đại lý, thống kê doanh thu và báo cáo hệ thống. |

---

## 🛠️ Cấu Trúc Dự Án

```bash
FixNowProject/
├── fe/
│   └── fixnow-app/          # Mã nguồn React Native (Expo)
│       ├── app/             # Các màn hình chính (Tabs, Layouts)
│       ├── components/      # UI Components tái sử dụng
│       ├── services/        # Gọi API (Axios configurations)
│       ├── context/         # Auth & Global State
│       └── constants/       # Theme, Colors, Configs
└── fixnow-backend/
    └── fixnow-backend/      # Mã nguồn Spring Boot
        ├── src/main/java/com/fixnow/
        │   ├── controller/  # RESTful Endpoints
        │   ├── service/     # Business Logic layer
        │   ├── repository/  # Data Access layer
        │   ├── entity/      # JPA Entities (Database models)
        │   ├── dto/         # Data Transfer Objects
        │   └── security/    # JWT & Security configurations
        └── pom.xml          # Dependencies & Build config
```

---

## ⚙️ Cài Đặt & Chạy

### 1. Yêu cầu hệ thống
- **Java 17** trở lên
- **Node.js** (v18+) & **npm/yarn**
- **MySQL Server**
- **Expo Go** (trên điện thoại) hoặc Android/iOS Emulator

### 2. Chạy Backend
```bash
# Di chuyển vào folder backend
cd fixnow-backend/fixnow-backend

# Cấu hình application.properties (Cần setup Database & Cloudinary keys)
# src/main/resources/application.properties

# Chạy project
mvn clean install
mvn spring-boot:run
```

### 3. Chạy Frontend
```bash
# Di chuyển vào folder app
cd fe/fixnow-app

# Cài đặt dependencies
npm install

# Khởi chạy Expo
npx expo start
```
*Gợi ý: Dùng App Expo Go trên điện thoại quét mã QR để trải nghiệm thực tế.*

---

## 📱 Tính Năng & Màn Hình

### 1. Luồng Người Dùng (Customer Flow)
- **Màn hình Chào mừng (Welcome):** Giới thiệu & Onboarding.
- **Đăng ký/Đăng nhập:** Xác thực bảo mật qua JWT.
- **Trang chủ (Home):** Hiển thị danh sách cửa hàng tiêu biểu và dịch vụ hot.
- **Tìm kiếm (Explore):** Lọc dịch vụ theo danh mục, khu vực.
- **Đặt lịch (Booking):** Chọn dịch vụ, thời gian và mô tả tình trạng hư hỏng.
- **Quản lý Đơn hàng:** Theo dõi trạng thái đơn sửa chữa (Chờ duyệt, Đang sửa, Hoàn thành).
- **Hồ sơ (Profile):** Cập nhật thông tin cá nhân và lịch sử.

### 2. Luồng Kỹ Thuật Viên (Technician Flow)
- **Dashboard:** Thống kê đơn hàng trong ngày.
- **Quản lý Dịch vụ:** Thêm/Sửa/Xóa các gói sửa chữa của tiệm.
- **Tiếp nhận Đơn:** Xem chi tiết lỗi kỹ thuật và nhấn nhận đơn.
- **Thanh toán & Đánh giá:** Hoàn tất quy trình và nhận feedback từ khách.

---

## 📸 Giao Diện Demo

*Dưới đây là một số hình ảnh minh họa về giao diện ứng dụng (Cập nhật liên tục)*

| Trang chủ | Đặt lịch | Đơn hàng |
| :--: | :--: | :--: |
| ![Home](https://via.placeholder.com/200x400?text=Home+Screen) | ![Booking](https://via.placeholder.com/200x400?text=Booking+Screen) | ![Orders](https://via.placeholder.com/200x400?text=Order+History) |

---

## 📄 Giấy Phép & Tác Giả

Dự án được phát triển bởi **Team FixNow** thuộc môn học **MMA301**.
- Giảng viên hướng dẫn: ...
- Thành viên: ...

---
⭐ *Đừng quên thả sao (Star) nếu bạn thấy dự án này thú vị!*
