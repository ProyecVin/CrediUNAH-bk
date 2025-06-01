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

    saveCertificate = async (enrollmentId, uniqueCode, fileId, statusId = 1, certificateTypeId) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        
        try {

            if (!enrollmentId || !uniqueCode || !fileId || !certificateTypeId) {
                throw new Error('Missing required parameters for certificate saving');
            }

            const query = `
                INSERT INTO linkage.Certificates (
                    enrollment_id,
                    unique_code,
                    issue_date,
                    file_id,
                    status_id,
                    certificate_type_id
                ) 
                VALUES (
                    @enrollmentId,
                    @uniqueCode,
                    GETDATE(),
                    @fileId,
                    @statusId,
                    @certificateTypeId
                )
            `;

            const result = await transaction.request()
                .input('enrollmentId', sql.Int, enrollmentId)
                .input('uniqueCode', sql.NVarChar, uniqueCode)
                .input('fileId', sql.Int, fileId)
                .input('statusId', sql.Int, statusId)
                .input('certificateTypeId', sql.NVarChar, certificateTypeId)
                .query(query);

            await transaction.commit();

            return {
                success: true,
                message: 'Certificado guardado exitosamente'
            };

        } catch (error) {
            if (transaction) await transaction.rollback();
            
            console.error('Error guardando certificado:', error);
            throw new Error(`Error al guardar certificado: ${error.message}`);

        };

    };
}

module.exports = new CertificateModel();