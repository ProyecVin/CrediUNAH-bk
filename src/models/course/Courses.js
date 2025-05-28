// src/models/operational/Courses.js
const sql = require('mssql');
const config = require('../../config/database');

class CoursesModel {
    async getCoursesForLanding() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .execute('linkage.get_courses_for_landing'); // Llamamos al procedimiento almacenado
            return result.recordset; // Devuelve array de cursos para landing
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CoursesModel();