const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/authRoutes');
const usuarios = require('./routes/routes');
const certificatesRoutes = require('./routes/certificatesRoutes');

router.use('/auth', authRoutes);
router.use('/usuarios', usuarios);
router.use('/certificates', certificatesRoutes);

module.exports = router;