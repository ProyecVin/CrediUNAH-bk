// src/routes/enrollmentsRoutes.js
const express = require('express');
const router = express.Router();

const EnrollmentController = require('../Controllers/enrollments/enrollmentController');

router.post('/grade', EnrollmentController.gradeStudent);
router.get('/course/:courseId', EnrollmentController.getAllCourseEnrollmentsForAdmin);

module.exports = router;
