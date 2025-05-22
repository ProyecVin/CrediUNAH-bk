const express = require('express');
const router = express.Router();
const coursesAdminController = require('../Controllers/course/coursesAdminController');

// localhost:3000/api/courses/landing
router.get('/admin', coursesAdminController.getCoursesForAdmin);

module.exports = router;