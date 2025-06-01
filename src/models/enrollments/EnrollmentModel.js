const { getConnection, sql } = require('../../config/awsDB');
const config = require('../../config/awsDB');

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

    async upsertGrade({ student_id, course_id, grade, comments }) {
    try {
      const pool = await sql.connect(config);

      const result = await pool.request()
        .input('student_id', sql.NVarChar(15), student_id)
        .input('course_id', sql.Int, course_id)
        .input('grade', sql.Decimal(5, 2), grade)
        .input('comments', sql.NVarChar(sql.MAX), comments || null)
        .query(`
          IF EXISTS (
            SELECT 1 FROM linkage.Course_Enrollments
            WHERE student_id = @student_id AND course_id = @course_id
          )
          BEGIN
            UPDATE linkage.Course_Enrollments
            SET grade = @grade,
                comments = @comments,
                evaluated_at = GETDATE(),
                last_updated_at = GETDATE()
            WHERE student_id = @student_id AND course_id = @course_id
          END
          ELSE
          BEGIN
            INSERT INTO linkage.Course_Enrollments (
              student_id, course_id, enrolled_at, evaluated_at, grade, comments, last_updated_at
            )
            VALUES (
              @student_id, @course_id, GETDATE(), GETDATE(), @grade, @comments, GETDATE()
            )
          END
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = new EnrollmentModel();
