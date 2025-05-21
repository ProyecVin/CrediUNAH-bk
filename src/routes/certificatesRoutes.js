const express = require('express');
const router = express.Router();

const CertificatesController = require('../controllers/certificates/certificatesController.js');

router.get('/', CertificatesController.getAllCertificates);

module.exports = router;