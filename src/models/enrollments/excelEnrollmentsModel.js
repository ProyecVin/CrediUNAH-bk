/*const sql = require('mssql');
const config = require('../../config/awsDB');

const ExcelEnrollmentsModel = {
  updateGradeFromExcel: async ({ student_id, course_id, grade, comments }) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('student_id', sql.NVarChar(15), student_id)
      .input('course_id', sql.Int, course_id)
      .input('grade', sql.Decimal(5, 2), grade)
      .input('comments', sql.NVarChar(sql.MAX), comments)
      .execute('linkage.sp_UpdateStudentGrade');
  }
};

module.exports = ExcelEnrollmentsModel;*/

const { sql, getConnection } = require('../../config/awsDB'); // nombre correcto del archivo

const ExcelEnrollmentsModel = {
  updateGrade: async ({ student_id, course_id, grade, comments }) => {
    const pool = await getConnection(); // ✅ usa la conexión ya establecida
    return pool.request()
      .input('student_id', sql.NVarChar(15), student_id)
      .input('course_id', sql.Int, course_id)
      .input('grade', sql.Decimal(5, 2), grade)
      .input('comments', sql.NVarChar(sql.MAX), comments)
      .execute('linkage.sp_UpdateStudentGrade');
  }
};

module.exports = ExcelEnrollmentsModel;

