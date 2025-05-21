const { getConnection, sql } = require('../../config/awsDB');

class EnrollmentModel {

    getAllCourseEnrollments = async (courseId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request().query(`
                SELECT 
                    U.ID AS STUDENT_DNI, 
                    U.FULL_NAME AS STUDENT_NAME,
                    ES.ID AS STATUS_ID,
                    ES.NAME AS STATUS
                FROM 
                    LINKAGE.COURSE_ENROLLMENTS E
                    LEFT JOIN LINKAGE.USERS U ON (U.ID = E.STUDENT_ID)
                    LEFT JOIN LINKAGE.ENROLLMENT_STATUS ES ON (ES.ID = E.STATUS_ID)
                WHERE E.COURSE_ID = ${courseId}
            `);
            return result.recordset;        
        } catch (error) {
            return error;
        }
    }

}

module.exports = new EnrollmentModel();