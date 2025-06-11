// src/models/operational/InstructorsModel.js
/*const sql = require('mssql');
const config = require('../../config/database');

class InstructorsModel {
    async getInstructorsByUnit(unitId) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('unitId', sql.Int, unitId)
                .query(`
                    SELECT ci.*, c.UnitId
                    FROM linkage.Course_Instructors ci
                    INNER JOIN linkage.Courses c ON ci.CourseId = c.Id
                    WHERE c.UnitId = @unitId
                `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new InstructorsModel();*/


const sql = require('mssql');
const {getConnection} = require('../../config/awsDB');

const CourseInstructorsModel = {
  getAll: async () => {
    const pool = await getConnection();
    return pool.request().execute('linkage.sp_GetAllCourseInstructors');
  },

  getByCourse: async (course_id) => {
    const pool = await getConnection();
    return pool.request()
      .input('course_id', sql.Int, course_id)
      .execute('linkage.sp_GetInstructorsByCourse');
  },

  getByInstructor: async (user_id) => {
    const pool = await getConnection();
    return pool.request()
      .input('user_id', sql.NVarChar(15), user_id)
      .execute('linkage.sp_GetCoursesByInstructor');
  },

  assign: async ({ user_id, course_id, assigned_at, is_titular }) => {
    const pool = await getConnection();
    return pool.request()
      .input('user_id', sql.NVarChar(15), user_id)
      .input('course_id', sql.Int, course_id)
      .input('assigned_at', sql.DateTime, assigned_at)
      .input('is_titular', sql.Bit, is_titular)
      .execute('linkage.sp_AssignInstructorToCourse');
  },

  update: async ({ ID, assigned_at, is_titular }) => {
    const pool = await getConnection();
    return pool.request()
      .input('ID', sql.Int, ID)
      .input('assigned_at', sql.DateTime, assigned_at)
      .input('is_titular', sql.Bit, is_titular)
      .execute('linkage.sp_UpdateInstructorAssignment');
  },

  remove: async (ID) => {
    const pool = await getConnection();
    return pool.request()
      .input('ID', sql.Int, ID)
      .execute('linkage.sp_DeleteInstructorAssignment');
  }
};

module.exports = CourseInstructorsModel;
