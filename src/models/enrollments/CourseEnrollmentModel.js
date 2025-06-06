/*const { getConnection, sql } = require('../../config/awsDB');
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

    getAllCourseEnrollmentsForAdmin = async (courseId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request().query(`
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY U.FULL_NAME) AS no,
                    E.ID AS enrollmentId,
                    U.ID AS sIdentity, 
                    U.FULL_NAME AS name,
                    ES.ID AS statusId,
                    ES.NAME AS obs,
                    E.grade
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

module.exports = new EnrollmentModel();*/

const sql = require('mssql');
const config = require('../../config/awsDB');

const CourseEnrollmentsModel = {
  create: async ({ student_id, course_id, enrolled_at, evaluated_at = null, status_id, grade = null, comments = null, last_updated_at, project_id = null }) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('student_id', sql.NVarChar(15), student_id)
      .input('course_id', sql.Int, course_id)
      .input('enrolled_at', sql.DateTime, enrolled_at)
      .input('evaluated_at', sql.DateTime, evaluated_at)
      .input('status_id', sql.Int, status_id)
      .input('grade', sql.Decimal(5, 2), grade)
      .input('comments', sql.NVarChar(sql.MAX), comments)
      .input('last_updated_at', sql.DateTime, last_updated_at)
      .input('project_id', sql.Int, project_id)
      .execute('linkage.sp_CreateCourseEnrollment');
  },

  update: async ({ ID, evaluated_at, status_id, grade, comments, last_updated_at }) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('ID', sql.Int, ID)
      .input('evaluated_at', sql.DateTime, evaluated_at)
      .input('status_id', sql.Int, status_id)
      .input('grade', sql.Decimal(5, 2), grade)
      .input('comments', sql.NVarChar(sql.MAX), comments)
      .input('last_updated_at', sql.DateTime, last_updated_at)
      .execute('linkage.sp_UpdateCourseEnrollment');
  },

  delete: async (ID) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('ID', sql.Int, ID)
      .execute('linkage.sp_DeleteCourseEnrollment');
  },

  getAll: async () => {
    const pool = await sql.connect(config);
    return pool.request().execute('linkage.sp_GetAllCourseEnrollments');
  },

  getById: async (ID) => {
    const pool = await sql.connect(config);
    return pool.request()
      .query(`SELECT * FROM linkage.Course_Enrollments WHERE ID = ${ID}`);
  },

  getByCourse: async (course_id) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('course_id', sql.Int, course_id)
      .execute('linkage.sp_GetEnrollmentsByCourse');
  },

  getByStudent: async (student_id) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('student_id', sql.NVarChar(15), student_id)
      .execute('linkage.sp_GetEnrollmentsByStudent');
  }
};

module.exports = CourseEnrollmentsModel;

