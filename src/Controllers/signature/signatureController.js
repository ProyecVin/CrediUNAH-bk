// src/controllers/signatures/signatureController.js
const SignatureModel = require('../../models/signature/SignatureModel');

class SignatureController {
  async getAll(req, res) {
    try {
      const result = await SignatureModel.getAllSignatures();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await SignatureModel.getSignatureById(id);
      if (!result) return res.status(404).json({ message: 'Firma no encontrada' });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const success = await SignatureModel.createSignature(req.body);
      res.status(success ? 201 : 400).json({ message: success ? 'Firma creada' : 'Error al crear' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const success = await SignatureModel.updateSignature(id, req.body);
      res.status(success ? 200 : 404).json({ message: success ? 'Actualizada' : 'No se encontró la firma' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const success = await SignatureModel.deleteSignature(id);
      res.status(success ? 200 : 404).json({ message: success ? 'Eliminada' : 'No se encontró la firma' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new SignatureController();
