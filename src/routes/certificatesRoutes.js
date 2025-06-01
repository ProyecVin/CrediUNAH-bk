const express = require('express');
const router = express.Router();

//const CertificatesController = require('../controllers/certificates/certificatesController.');
const CertificatesController = require('../Controllers/certificates/certificatesController');

router.get('/generate/:courseId', CertificatesController.generateCertificates);

module.exports = router;