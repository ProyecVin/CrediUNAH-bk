const express = require('express');
const router = express.Router();

const OperatinalUnitsController = require('../controllers/operational/operationalUnitsController');

router.get('/units', OperatinalUnitsController.getAllOperationalUnits);

module.exports = router;