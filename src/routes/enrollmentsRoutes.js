// src/routes/enrollmentsRoutes.js
const express = require('express');
const router = express.Router();


const EnrollmentController = require('../Controllers/enrollments/enrollmentController');

router.post('/grade', EnrollmentController.gradeStudent);

module.exports = router;
