const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/course/coursesController');

// localhost:3000/api/courses/landing
router.get('/landing', coursesController.getCoursesForLanding);

module.exports = router;