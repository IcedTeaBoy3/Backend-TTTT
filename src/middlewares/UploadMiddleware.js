const multer = require('multer');
const path = require('path');

// Cấu hình thư mục lưu file và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // lấy phần mở rộng .jpg, .png,...
    const baseName = path.basename(file.originalname, ext); // lấy tên gốc (không có đuôi)
    const newFileName = `${baseName}-${uniqueSuffix}${ext}`;
    cb(null, newFileName);
  }
});

// Lọc file: chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép file ảnh với định dạng .jpeg, .jpg, .png, .gif'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

module.exports = upload;