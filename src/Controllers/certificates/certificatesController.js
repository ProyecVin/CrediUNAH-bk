const CertificateService = require('../../services/certificates/certificatesServices');

class CertificatesController {

  constructor() {
    this.certificateService = CertificateService;
  }

  generateCertificates = async (req, res) => {
    try {
        const result = await this.certificateService.generateCourseCertificates(req.params.courseId);
        res.json ({ success: true, message: 'Certificates generated', result});
    } catch (error) {
        console.error('Error generating certificates:', error);
        return res.status(500).json({ success: false, message: 'Error generating certificates', error: error.message });
    }
  }

}

module.exports = new CertificatesController();