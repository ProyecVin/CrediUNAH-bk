const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/authRoutes');
const usuarios = require('./routes/routes');
const operationalUnistRoutes = require('./routes/operationalUnitsRoutes')
const coursesRoutes = require('./routes/coursesRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuarios);
router.use('/operation', operationalUnitsRoutes);
router.use('/courses', coursesRoutes); 

module.exports = router;