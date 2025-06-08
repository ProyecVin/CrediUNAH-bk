// src/models/certificates/certificatesUserModel.js
const sql = require('mssql');
const config = require('../../config/database');
class CertificatesUserModel {
  async getCertificatesByIdentity(identity) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('identity', sql.NVarChar, identity)
        .query(`
          SELECT 
            c.ID AS id,
            c.title AS courseName,
            FORMAT(cert.issue_date, 'dd \\de MMMM \\del yyyy', 'es-ES') AS completionDate,
            i.full_name AS instructorName,
            m.URL AS pdfUrl,
            cert.issue_date AS dateObject
          FROM linkage.Certificates cert
          INNER JOIN linkage.Course_Enrollments ce ON cert.enrollment_id = ce.ID
          INNER JOIN linkage.Courses c ON ce.course_id = c.ID
          INNER JOIN linkage.Course_Instructors ci ON ci.course_id = c.ID AND ci.is_titular = 1
          INNER JOIN linkage.Users i ON ci.user_id = i.ID
          INNER JOIN linkage.Media m ON m.ID = cert.file_id
          WHERE ce.student_id = @identity
        `);

      return result.recordset;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new CertificatesUserModel();