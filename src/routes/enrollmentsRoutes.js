// src/routes/enrollmentsRoutes.js
const express = require('express');
const router = express.Router();

//const EnrollmentController = require('../Controllers/enrollments/enrollmentController');
//const upload = require('../../middleware/uploadExcel');
const EnrollmentController = require('../Controllers/enrollments/enrollmentController');
const upload = require('../middleware/uploadExcel');

router.post('/grade', EnrollmentController.gradeStudent);
router.get('/course/:courseId', EnrollmentController.getAllCourseEnrollmentsForAdmin);
router.post('/import-excel', upload.single('excel'), EnrollmentController.importGradesFromExcel);





module.exports = router;

