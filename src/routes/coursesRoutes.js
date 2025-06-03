// File: src/routes/coursesRoutes.js
const express = require('express');
const router = express.Router();

const coursesController = require('../Controllers/course/coursesController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multer');

// localhost:3000/api/courses/landing
router.post('/new', auth, upload.single('image'), coursesController.createCourse);
router.put('/:id/', auth, upload.single('image'), coursesController.updateCourse);
router.get('/landing', coursesController.getCourses);
router.delete('/:id', auth, coursesController.deleteCourse);
router.get('/inactive', auth, coursesController.getInactiveCourses);

module.exports = router;