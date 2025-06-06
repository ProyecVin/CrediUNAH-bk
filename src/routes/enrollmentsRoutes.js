// src/routes/enrollmentsRoutes.js
const express = require('express');
const router = express.Router();

//const EnrollmentController = require('../Controllers/enrollments/enrollmentController');
//const upload = require('../../middleware/uploadExcel');
const EnrollmentController = require('../Controllers/enrollments/enrollmentController');
const upload = require('../middleware/upload');

router.post('/grade', EnrollmentController.gradeStudent);
router.get('/course/:courseId', EnrollmentController.getAllCourseEnrollmentsForAdmin);
router.post('/import-excel', upload.single('excel'), EnrollmentController.importGradesFromExcel);



/*
const upload = require('../middleware/upload');
//const EnrollmentController = require('../Controllers/enrollments/enrollmentController');
//const upload = require('../../middleware/uploadExcel');
const EnrollmentController = require('../Controllers/enrollments/enrollmentController');


router.post('/grade', EnrollmentController.gradeStudent);
router.get('/course/:courseId', EnrollmentController.getAllCourseEnrollmentsForAdmin);
//router.post('/import-excel', upload.single('excel'), EnrollmentController.importGradesFromExcel);
router.post('/grades/excel', upload.single('file'), EnrollmentsController.uploadGradesExcel);
 */

module.exports = router;

