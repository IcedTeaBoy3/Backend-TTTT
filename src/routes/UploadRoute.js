const express = require('express');
const router = express.Router();
const upload = require('../middlewares/UploadMiddleware'); // đường dẫn đúng tới file bạn vừa tạo

router.post('/', upload.single('upload'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file được tải lên' });
  }
  console.log('File uploaded:', req.file);
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  console.log('File URL:', fileUrl);
  return res.status(200).json({ url: fileUrl });
});

module.exports = router;
