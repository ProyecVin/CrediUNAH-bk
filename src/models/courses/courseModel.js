const { getConnection, sql } = require('../../config/awsDB');

class CourseModel {

    getCourseInfoForCertificates = async (courseId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .query(`
                SELECT 
                    C.ID AS COURSE_ID, 
                    C.TITLE AS COURSE_NAME, 
                    C.DESCRIPTION, 
                    C.DURATION_IN_HOURS, 
                    OU.ID AS OPERATIONAL_UNIT_ID, 
                    OU.NAME AS OPERATIONAL_UNIT_NAME,
                    CS.ID AS STATUS_ID,
                    CS.NAME AS STATUS
                FROM 
                    LINKAGE.COURSES C
                    LEFT JOIN LINKAGE.OPERATIONAL_UNITS OU ON ( OU.ID = C.OPERATIONAL_UNIT_ID )
                    LEFT JOIN LINKAGE.COURSE_STATUS_HISTORY CSH ON (CSH.COURSE_ID = C.ID)
                    LEFT JOIN LINKAGE.COURSE_STATUS CS ON (CS.ID = CSH.STATUS_ID)
                WHERE C.ID = 1 AND CSH.START_DATE = (
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