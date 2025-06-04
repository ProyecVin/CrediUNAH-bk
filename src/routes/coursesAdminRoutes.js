const express = require('express');
const router = express.Router();
const coursesAdminController = require('../Controllers/course/coursesAdminController');

// localhost:3000/api/courses/landing
<<<<<<< HEAD
router.get('/admin', coursesAdminController.getCoursesForAdmin);
=======
router.get('/all', coursesAdminController.getCoursesForAdmin);
>>>>>>> d80ebb03ab2cfcdea2a686e74e3daa6fc6ec4320
router.post('/update', coursesAdminController.updateCourse);


module.exports = router;



