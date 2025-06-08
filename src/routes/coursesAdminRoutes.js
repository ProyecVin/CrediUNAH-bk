const express = require('express');
const router = express.Router();
const coursesAdminController = require('../Controllers/course/coursesAdminController')

router.get('/all', coursesAdminController.getCoursesForAdmin);
router.get('/course/:id', coursesAdminController.getCourseInfoForAdmin);
router.post('/update', coursesAdminController.updateCourse);


module.exports = router;



