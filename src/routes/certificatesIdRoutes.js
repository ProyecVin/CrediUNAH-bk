const express = require('express');
const router = express.Router();
const certificatesUserController = require('../controllers/certificates/certificatesIdController.js');

// GET /api/certificates/user/:identity
router.get('/user/:identity', certificatesUserController.getCertificatesByIdentity);

module.exports = router;
