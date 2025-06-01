const { getConnection, sql } = require('../../config/awsDB');

class SignatureModel {

    getSignaturesByCourseAndCertificateType = async (courseId, certificateTypeId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .query(`SELECT 
                        M.ID as signatureImageId, 
                        M.NAME AS signatureImageName, 
                        M.DESCRIPTION AS signatureDescription, 
                        M.URL, 
                        CS.SIGNATURE_ORDER AS signatureOrder,
                        S.SIGNER_NAME AS signerName,
                        S.SIGNER_TITLE AS signerTitle,
                        S.IS_ACTIVE AS isActive,
                        S.ID AS signatureId
                    FROM LINKAGE.COURSE_CERTIFICATE_TYPES CCT
                    LEFT JOIN LINKAGE.CERTIFICATE_SIGNATURES CS ON (CS.CERTIFICATE_TYPE_ID = CCT.CERTIFICATE_TYPE_ID AND CS.COURSE_ID = CCT.COURSE_ID)
                    LEFT JOIN LINKAGE.SIGNATURES S ON (S.ID = CS.SIGNATURE_ID)
                    LEFT JOIN LINKAGE.MEDIA M ON (M.ID = S.SIGNATURE_IMAGE_ID)
                    WHERE CCT.COURSE_ID = ${courseId} AND CCT.CERTIFICATE_TYPE_ID = '${certificateTypeId}'
            `);

            return result.recordset;        
        } catch (error) {
            return error;
        }
    }

    isPhysicallySigned = async (courseId, certificateTypeId) => {
         try {
            const pool = await getConnection();
            const result = await pool.request()
            .query(`SELECT 
                        is_physically_signed 
                    FROM LINKAGE.COURSE_CERTIFICATE_TYPES CCT
                    WHERE CCT.COURSE_ID = ${courseId} AND CCT.CERTIFICATE_TYPE_ID = '${certificateTypeId}'
            `);

            return result.recordset;        
            
        } catch (error) {
            return error;
        }
    }

}

module.exports = new SignatureModel();