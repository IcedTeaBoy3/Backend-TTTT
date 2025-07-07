# 🧠 Backend-TTTT - Medicare API

Đây là **backend API** cho dự án **Medicare**, được xây dựng bằng **Node.js**, **Express.js**, và **MongoDB (Mongoose)**.  
Hệ thống hỗ trợ xác thực người dùng, gửi email, đăng nhập Google và tải file lên máy chủ.

---

## 🚀 Tech Stack

- **Node.js** + **Express.js** – Web server & REST API
- **MongoDB** + **Mongoose** – Cơ sở dữ liệu
- **JWT** – Xác thực người dùng
- **Multer** – Upload file
- **Nodemailer** – Gửi email
- **Google Auth** – Đăng nhập bằng Google

---

## 📁 Project Structure

.
├── src/

│ ├── config/ # Cấu hình kết nối DB

│ ├── controllers/ # Xử lý dữ liệu từ frontend

│ ├── middleware/ # Middleware (auth, upload, phân quyền)

│ ├── models/ # Mongoose models

│ ├── routes/ # Định nghĩa các API

│ ├── services/ # Xử lý logic nghiệp vụ

│ ├── utils/ # Các hàm tiện ích dùng chung

│ └── index.js # Điểm bắt đầu ứng dụng

├── .env # Biến môi trường

├── package.json

└── README.md

## ⚙️ Environment Variables
Tạo file `.env` ở thư mục gốc và thêm các biến sau:

MONGODB_URL=your_mongodb_connection_string

CLIENT_URL=http://localhost:3000

IS_PRODUCTION=false

PORT=5000

ACCESS_TOKEN_SECRET=your_access_token_secret

REFRESH_TOKEN_SECRET=your_refresh_token_secret

VERIFY_TOKEN_SECRET=your_verify_token_secret

MAIL_ACCOUNT=youremail@example.com

MAIL_PASSWORD=your_email_password

GOOGLE_CLIENT_ID=your_google_client_id
## ▶️ Cài đặt & Khởi động
### 1. Cài đặt package
```bash
npm install
```
### 2. Chạy server
```basg
npm start
```
