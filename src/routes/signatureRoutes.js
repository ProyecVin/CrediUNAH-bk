// src/routes/signatureRoutes.js
const express = require('express');
const router = express.Router();
const SignatureController = require('../Controllers/signature/signatureController');

router.get('/', SignatureController.getAll);
router.get('/:id', SignatureController.getById);
router.post('/', SignatureController.create);
router.put('/:id', SignatureController.update);
router.delete('/:id', SignatureController.delete);

module.exports = router;
