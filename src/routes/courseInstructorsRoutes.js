const express = require('express');
const router = express.Router();
const CourseInstructorsController = require('../Controllers/operational/courseInstructorsController');

// GET /instructors
router.get('/all', CourseInstructorsController.getAll);

// GET /courses/:courseId/instructors
router.get('/courses/:courseId/instructors', CourseInstructorsController.getByCourse);

// GET /:userId/courses
router.get('/:userId/courses', CourseInstructorsController.getByInstructor);

// POST /
router.post('/', CourseInstructorsController.assign);

// PUT /:id
router.put('/:id', CourseInstructorsController.update);

// DELETE /:id
router.delete('/:id', CourseInstructorsController.remove);

module.exports = router;
