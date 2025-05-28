const { getConnection, sql } = require('../../config/awsDB');

class EnrollmentModel {

    getAllCourseEnrollments = async (courseId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request().query(`
                SELECT 
                    E.ID AS enrollmentId,
                    U.ID AS studentDNI, 
                    U.FULL_NAME AS studentName,
                    ES.ID AS statusId,
                    ES.NAME AS status
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