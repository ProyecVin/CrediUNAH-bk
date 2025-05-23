const { getConnection, sql } = require('../../config/awsDB');

class CertificateLogoModel {

    getLogosByCourseAndCertificateType = async (courseId, certificateTypeId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .query(`SELECT 
                        M.ID as logoFileId, 
                        M.NAME AS logoFIleName, 
                        M.DESCRIPTION AS description, 
                        M.URL, 
                        CL.LOGO_ORDER AS logoOrder
                    FROM 
                        LINKAGE.COURSE_CERTIFICATE_TYPES CCT
                        LEFT JOIN LINKAGE.CERTIFICATE_LOGOS CL ON (CL.COURSE_ID = CCT.COURSE_ID AND CL.CERTIFICATE_TYPE_ID = CCT.CERTIFICATE_TYPE_ID)
                        LEFT JOIN LINKAGE.MEDIA M ON (M.ID = CL.LOGO_IMAGE_ID)
                    WHERE CCT.COURSE_ID = ${courseId} AND CCT.CERTIFICATE_TYPE_ID = '${certificateTypeId}'
            `);

            return result.recordset;        
        } catch (error) {
            return error;
        }
    }

    // Get all  info for certificates by course

}

module.exports = new CertificateLogoModel();