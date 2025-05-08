const express = require('express');
const router = express.Router();

const TestController = require('../controllers/test.controller.js');

router.get('/', TestController.getFilesFromS3);
router.post('/upload', TestController.uploadFileToS3);
router.get('/:fileName', TestController.getFileFromS3);
router.get('/:fileName/presignedURL', TestController.getPresignedURL);

module.exports = router;