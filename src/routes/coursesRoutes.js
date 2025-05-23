const express = require('express');
const router = express.Router();
const coursesController = require('../Controllers/course/coursesController');

// localhost:3000/api/courses/landing
router.get('/landing', coursesController.getCoursesForLanding);
router.get('/:id', coursesController.getCourseById);

module.exports = router;