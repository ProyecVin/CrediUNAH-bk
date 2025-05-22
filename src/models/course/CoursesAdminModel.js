// src/models/operational/Courses.js
const sql = require('mssql');
const config = require('../../config/database');

class CoursesAdminModel {
    async getCoursesForAdmin() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query('SELECT * FROM linkage.Courses'); // Consulta directa a la tabla o vista
            return result.recordset; // Devuelve array de cursos para landing
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CoursesAdminModel();