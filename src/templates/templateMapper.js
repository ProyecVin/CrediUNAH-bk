const certAprFacuInge01 = require('./certificates/certAprFacuInge01');
const constPartFacuInge01 = require('./certificates/constPartFacuInge01');

const TEMPLATE_MAPPER = {

  CAFI01: {
    generate: certAprFacuInge01.generateCertificate,
    validate: (enrollment) => enrollment.statusId === 5, // Aproved only
    defaultTemplateUrl: 'https://linkage-storage.s3.us-east-1.amazonaws.com/templates/certAprFacuInge01.pdf',
    requiredFields: ['studentDNI', 'studentName', 'courseName']
  },

  CPFI01: {
    generate: constPartFacuInge01.generateCertificate,
    validate: (enrollment) => true, // All
    defaultTemplateUrl: 'https://linkage-storage.s3.us-east-1.amazonaws.com/templates/certAprFacuInge01.pdf',
    requiredFields: ['studentDNI', 'studentName']
  }

};

module.exports = TEMPLATE_MAPPER;