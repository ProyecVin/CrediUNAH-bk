const express = require('express');
const router = express.Router();


const OperatinalUnitsController = require('../controllers/operational');

router.get('/units', OperatinalUnitsController.getAllOperationalUnits);

module.exports = router;

// localhost:3000/api/operation/units