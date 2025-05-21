const certAprFacuInge01 = require('./certificates/certAprFacuInge01');
const constPartFacuInge01 = require('./certificates/constPartFacuInge01');

const TEMPLATE_MAPPER = {
  CAFI01: certAprFacuInge01,
  CPFI01: constPartFacuInge01,
};

module.exports = TEMPLATE_MAPPER;