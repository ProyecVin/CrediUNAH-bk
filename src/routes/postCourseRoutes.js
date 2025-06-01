const express = require('express');
const router = express.Router();


const postCourseController = require('../Controllers/postCourse/postCourseController');

router.post('/register', postCourseController.registerCourse); // POST /api/courses/register

module.exports = router;
