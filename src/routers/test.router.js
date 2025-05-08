const express = require('express');
const router = express.Router();

const TestController = require('../controllers/test.controller.js');

router.get('/', TestController.getFilesFromS3);
router.post('/upload', TestController.uploadFileToS3);
router.get('/:filePath(*)', TestController.getFileFromS3);
router.get('/presignedURL/:folderName/:fileName', TestController.getPresignedURL);

module.exports = router;