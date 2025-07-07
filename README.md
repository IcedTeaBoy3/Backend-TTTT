# 🧠 Backend-TTTT - Backend API
Đây là backend API cho dự án Medicare, sử dụng Node.js, Express.js, and MongoDB (Mongoose).

## 🚀 Tech Stack
- **Node.js** + **Express.js** – Web server & API
- **MongoDB** + **Mongoose** – Database
- **JWT** – Authentication
- **Multer** – File uploads
- **Nodemailer** – Email services
- **Google Auth** – OAuth2 login support

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

## ▶️ Start Server
npm start
Mặc định server sẽ chạy tại: http://localhost:5000
