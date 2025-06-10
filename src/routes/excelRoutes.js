const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ExcelEnrollmentsController = require('../Controllers/enrollments/excelEnrololmentsController');

router.post('/grades/excel', upload.single('file'), ExcelEnrollmentsController.uploadGradesExcel);

module.exports = router;
