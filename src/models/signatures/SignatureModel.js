const { getConnection, sql } = require('../../config/awsDB');

class SignatureModel {

    getSignaturesByCourseAndCertificateType = async (courseId, certificateTypeId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .query(`SELECT 
                        M.ID as SIGNATURE_IMAGE_ID, 
                        M.NAME AS SIGNATURE_IMAGE_NAME, 
                        M.DESCRIPTION AS SIGNATURE_DESCRIPTION, 
                        M.URL, 
                        CS.SIGNATURE_ORDER,
                        S.SIGNER_NAME,
                        S.SIGNER_TITLE,
                        S.IS_ACTIVE,
                        S.ID AS SIGNATURE_ID
                    FROM LINKAGE.COURSE_CERTIFICATE_TYPES CCT
                    LEFT JOIN LINKAGE.CERTIFICATE_SIGNATURES CS ON (CS.CERTIFICATE_TYPE_ID = CCT.CERTIFICATE_TYPE_ID AND CS.COURSE_ID = CCT.COURSE_ID)
                    LEFT JOIN LINKAGE.SIGNATURES S ON (S.ID = CS.SIGNATURE_ID)
                    LEFT JOIN LINKAGE.MEDIA M ON (M.ID = S.SIGNATURE_IMAGE_ID)
                    WHERE CCT.COURSE_ID = ${courseId} AND CCT.CERTIFICATE_TYPE_ID = ${certificateTypeId}
            `);

            return result.recordset;        
        } catch (error) {
            return error;
        }
    }

}

module.exports = new SignatureModel();