const CertificateModel = require('../../models/certificates/certificateModel.js');
const CertificateService = require('../../services/certificates/certificateService.js');

class CertificatesController {

  constructor() {}

  async getAllCertificates(req, res) {
    const result = await CertificateModel.getAllCertificates();

    res.json({ message: 'Certificates Controller...', result });
  }

}

module.exports = new CertificatesController();