const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/authRoutes');
const certificatesRoutes = require('./routes/certificatesRoutes');
const operationalUnistRoutes = require('./routes/operationalUnitsRoutes');
const coursesRoutes = require('./routes/coursesRoutes');

router.use('/auth', authRoutes);
router.use('/operation', operationalUnistRoutes);
router.use('/courses', coursesRoutes); 
router.use('/certificates', certificatesRoutes);

module.exports = router;