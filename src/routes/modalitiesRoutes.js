const express = require('express');
const router = express.Router();

const modalitiesController = require('../Controllers/modalities/modalitiesController');

// Ruta: http://localhost:3000/api/modalities/all
router.get('/all', modalitiesController.getAllModalities);

module.exports = router;
