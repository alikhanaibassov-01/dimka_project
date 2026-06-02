const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const express = require('express');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Только JPEG, PNG или WebP'), ok);
  },
});

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Выберите изображение / Сурет таңдаңыз' });
    }

    const filename = `product-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toFile(filepath);

    res.json({ imageUrl: `/uploads/${filename}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
