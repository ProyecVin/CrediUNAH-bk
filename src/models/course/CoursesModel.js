// src/models/operational/Courses.js
const sql = require('mssql');
const config = require('../../config/database');

class CoursesModel {
    async getCoursesForLanding() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query(`
                    SELECT 
                        c.*,
                        cs.name AS status
                    FROM 
                        linkage.Courses c
                    JOIN (
                        SELECT 
                            course_id, 
                            status_id,
                            ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY start_date DESC) as rn
                        FROM linkage.course_status_history
                    ) csh ON c.id = csh.course_id AND csh.rn = 1
                    JOIN linkage.course_status cs ON csh.status_id = cs.id
                    WHERE 
                        cs.id = 1  -- Filtro por cursos en oferta (status_id = 1)
                        AND c.end_date >= GETDATE()  -- Solo cursos vigentes
                `);
            return result.recordset;
        } catch (err) {
            console.error('Error al obtener cursos para landing:', err);
            throw err;
        }
    }
}

module.exports = new CoursesModel();