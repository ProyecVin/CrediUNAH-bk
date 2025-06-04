const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/course/coursesController');
<<<<<<< HEAD
=======
const courseAdminRoutes = require('./coursesAdminRoutes');


router.use('/admin', courseAdminRoutes);
>>>>>>> d80ebb03ab2cfcdea2a686e74e3daa6fc6ec4320

// localhost:3000/api/courses/landing
router.get('/landing', coursesController.getCoursesForLanding);
router.get('/:id', coursesController.getCourseById);

module.exports = router;