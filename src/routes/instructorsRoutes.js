// src/routes/instructorsRoutes.js
const express = require('express');
const router = express.Router();
const instructorsController = require('../Controllers/operational/instructorsController');

router.get('/by-unit/:unitId', instructorsController.getInstructorsByUnit);

module.exports = router;

