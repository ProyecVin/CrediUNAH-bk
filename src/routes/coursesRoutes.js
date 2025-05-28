const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/course/coursesController');

router.get('/landing', coursesController.getCoursesForLanding);

module.exports = router;