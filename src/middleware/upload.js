/*const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });
module.exports = upload;*/

// middlewares/upload.js
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
module.exports = upload;