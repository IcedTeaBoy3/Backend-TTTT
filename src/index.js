const express = require('express');
const app = express();
const dotenv = require('dotenv');
const db = require('./config/db');
const routes = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load env variables
dotenv.config();
// Cors
app.use(cors(
    {
        origin: [process.env.CLIENT_URL, 'http://localhost:3001'], // Thêm localhost vào danh sách cho phép, // Địa chỉ frontend
        credentials: true,
    }
));
// Body parser
app.use(express.json({ limit: '50mb' }));
// Body parser
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Cookie parser // để lấy cookie từ req mà không cần phải truyền vào từ header hoặc body
app.use(cookieParser());
// Port
const Port = process.env.PORT || 5000;

// Connect to MongoDB
db.connect();

// Routes
routes(app);

app.listen(Port, () => {
    console.log('Server is running on port ' + Port);
});
