const express = require('express');
const router = express.Router();

const TestController = require('../controllers/test.controller.js');

router.post('/qrcode/generate', TestController.generateQRCode);

router.get('/files/', TestController.getFilesFromS3);
router.post('/files/upload', TestController.uploadFileToS3);
router.get('/files/:filePath(*)', TestController.getFileFromS3);
router.get('/files/presignedURL/:folderName/:fileName', TestController.getPresignedURL);
module.exports = router;