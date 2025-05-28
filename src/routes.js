const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/authRoutes');
const certificatesRoutes = require('./routes/certificatesRoutes');

router.use('/auth', authRoutes);

router.use('/certificates', certificatesRoutes);

module.exports = router;