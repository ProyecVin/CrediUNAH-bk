const { getConnection, sql } = require('../../config/awsDB');

class CertificateModel {

    // Get all certificates
    getAllCertificates = async () => {  
        try {
            const pool = await getConnection();
            const result = await pool.request().query('SELECT * FROM linkage.certificates');
            return result.recordset;        
        } catch (error) {
            return error;
        }
    }

    // Get all  info for certificates by course

}

module.exports = new CertificateModel();