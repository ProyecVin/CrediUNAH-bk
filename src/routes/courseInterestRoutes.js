const express = require('express');
const router = express.Router();
const CourseInterestsController = require('../Controllers/postCourse/courseInterestController');

// GET /api/course-interests
router.get('/', CourseInterestsController.getAll);

// GET /api/courses/:courseId/interests
router.get('/courses/:courseId/interests', CourseInterestsController.getByCourse);

// POST /api/course-interests
router.post('/', CourseInterestsController.create);

// PUT /api/course-interests
router.put('/', CourseInterestsController.update);

module.exports = router;
