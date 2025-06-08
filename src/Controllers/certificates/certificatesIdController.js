// src/controllers/operational/CertificatesUserController.js
const CertificatesUserModel = require('../../models/certificates/CertificatesIdModel');

class CertificatesUserController {
  async getCertificatesByIdentity(req, res) {
    try {
      const { identity } = req.params;
      const certificates = await CertificatesUserModel.getCertificatesByIdentity(identity);
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = new CertificatesUserController();