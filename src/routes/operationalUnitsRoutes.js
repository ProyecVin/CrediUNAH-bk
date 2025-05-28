const express = require('express');
const router = express.Router();

const OperatinalUnitsController = require('../controllers/operational/operationalUnitsController');

// localhost:3000/api/operation/units
router.get('/units', OperatinalUnitsController.getAllOperationalUnits);

module.exports = router;

