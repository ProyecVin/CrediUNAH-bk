const express = require('express');
const router = express.Router();


const OperationalUnitsController = require('../Controllers/operational/operationalUnitsController');
// localhost:3000/api/operation/units
router.get('/units', OperationalUnitsController.getAllOperationalUnits);

module.exports = router;

