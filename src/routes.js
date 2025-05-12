const express = require('express');
const router = express.Router();




const authRoutes = require('./routes/authRoutes');


const usuarios = require('./routes/routes');
router.use('/auth', authRoutes);
router.use('/usuarios', usuarios);


module.exports = router;