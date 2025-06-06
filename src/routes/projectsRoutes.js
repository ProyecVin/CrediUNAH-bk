const express = require('express');
const router = express.Router();
const ProjectsController = require('../Controllers/projects/projectsController');

// GET /projects
router.get('/', ProjectsController.getAll);

// POST /projects
router.post('/', ProjectsController.create);

module.exports = router;
