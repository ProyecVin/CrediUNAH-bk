const { getConnection, sql } = require('../../config/awsDB');

class CourseModel {

    getCourseInfoForCertificates = async (courseId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .query(`
                SELECT 
                    C.ID AS courseId, 
                    C.TITLE AS courseName, 
                    C.DESCRIPTION AS description, 
                    C.DURATION_IN_HOURS AS durationInHours, 
                    C.SKILLS AS skills,
                    OU.ID AS operationalUnitId, 
                    OU2.ID AS certifyingOpUnitId,
                    OU.NAME AS operationalUnitName,
                    OU2.NAME AS certifyingOpUnitName,
                    OU2.CERTIFICATES_ISSUED AS certifyingOpUnitCertificateIssued,
                    CS.ID AS statusId,
                    CS.NAME AS status,
                    CT.ID AS courseTypeId,
                    CT.NAME AS courseTypeName
                FROM 
                    LINKAGE.COURSES C
                    LEFT JOIN LINKAGE.OPERATIONAL_UNITS OU ON ( OU.ID = C.OPERATIONAL_UNIT_ID )
                    LEFT JOIN LINKAGE.OPERATIONAL_UNITS OU2 ON ( OU2.ID = C.CERTIFYING_OP_UNIT_ID )
                    LEFT JOIN LINKAGE.COURSE_STATUS_HISTORY CSH ON (CSH.COURSE_ID = C.ID)
                    LEFT JOIN LINKAGE.COURSE_STATUS CS ON (CS.ID = CSH.STATUS_ID)
                    LEFT JOIN LINKAGE.COURSE_TYPES CT ON (CT.ID = C.COURSE_TYPE_ID)
                WHERE C.ID = ${courseId} AND CSH.START_DATE = (
                    SELECT MAX( START_DATE )
                    FROM LINKAGE.COURSE_STATUS_HISTORY
                    WHERE COURSE_ID = ${courseId}
                );`);
            return result.recordset;        
        } catch (error) {
            return error;
        }
    }
}

module.exports = new CourseModel();