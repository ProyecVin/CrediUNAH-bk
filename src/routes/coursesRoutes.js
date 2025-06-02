const express = require('express');
const router = express.Router();

const coursesController = require('../Controllers/course/coursesController');
const auth = require('../middleware/auth');

// localhost:3000/api/courses/landing
router.post('/new', auth, coursesController.createCourse);
router.put(/:id/, auth, coursesController.updateCourse);
router.get('/landing', coursesController.getCourses);
router.get('/:id', auth, coursesController.deleteCourse);

module.exports = router;