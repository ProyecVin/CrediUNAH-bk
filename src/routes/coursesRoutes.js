const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/course/coursesController');
const courseAdminRoutes = require('./coursesAdminRoutes');


router.use('/admin', courseAdminRoutes);

// localhost:3000/api/courses/landing
router.get('/landing', coursesController.getCoursesForLanding);
router.get('/:id', coursesController.getCourseById);

module.exports = router;