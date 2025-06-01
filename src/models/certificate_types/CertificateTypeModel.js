const { getConnection, sql } = require('../../config/awsDB');

class CertificateTypeModel {

    async getAllCertificateTypesByCourse(courseId) {  
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .query(`SELECT 
                        CT.ID AS certificateTypeId, 
                        CT.NAME AS certificateTypeName, 
                        CT.DESCRIPTION AS certificateTypeDecription,
                        M.ID AS templateFileId,
                        M.NAME AS templateFileName,
                        M.DESCRIPTION AS templateFileDescription,
                        M.URL AS templateFileURL
                    FROM 
                        LINKAGE.COURSES C 
                        LEFT JOIN LINKAGE.COURSE_CERTIFICATE_TYPES CCT ON (CCT.COURSE_ID = C.ID)
                        LEFT JOIN LINKAGE.CERTIFICATE_TYPES CT ON (CT.ID = CCT.CERTIFICATE_TYPE_ID)
                        LEFT JOIN LINKAGE.MEDIA AS M ON (M.ID = CT.TEMPLATE_FILE_ID)
                    WHERE C.ID = ${courseId}
            `);

            return result.recordset;        
        } catch (error) {
            return error;
        }
    }

}

module.exports = new CertificateTypeModel();