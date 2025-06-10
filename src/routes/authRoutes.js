// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../Controllers/auth/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Rutas públicas (no requieren autenticación)
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

router.post('/forgot-password', authController.forgotPassword)

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, roleCheck(['admin', 'usuario']), authController.getProfile);

module.exports = router;