// File: src/routes/coursesRoutes.js
const multer = require('multer');
const path = require('path');

// Tamaño máximo: 20MB
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

// Extensiones permitidas
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

// Filtro de archivos: solo imágenes válidas
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (.jpg, .jpeg, .png, .webp).'), false);
  }
};

// Almacenamiento en memoria (ideal para subir a S3)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

module.exports = upload;
