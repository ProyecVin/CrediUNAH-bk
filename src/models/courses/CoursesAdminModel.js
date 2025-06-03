const sql = require('mssql');
const config = require('../../config/database');

class CoursesAdminModel {
    async getCoursesForAdmin() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query(`
                        SELECT 
                            C.ID AS code,
                            C.title AS name,
                            U.full_name AS instructor,
                            C.duration_in_hours AS duration,
                            CS.name AS status
                        FROM linkage.Courses C
                        LEFT JOIN linkage.Course_Instructors CI ON (CI.course_id = C.ID AND CI.is_titular = 1)
                        LEFT JOIN linkage.Users U ON (U.ID = CI.user_id)
                        LEFT JOIN (
                            SELECT CSH1.course_id, CSH1.status_id, CSH1.start_date
                            FROM linkage.Course_Status_History CSH1
                            INNER JOIN (
                                SELECT course_id, MAX(start_date) as max_date
                                FROM linkage.Course_Status_History
                                GROUP BY course_id
                            ) CSH2 ON CSH1.course_id = CSH2.course_id AND CSH1.start_date = CSH2.max_date
                        ) CSH ON CSH.course_id = C.ID
                        LEFT JOIN linkage.Course_Status CS ON (CS.ID = CSH.status_id)
                        WHERE CS.name != 'En oferta';
                    `); // Consulta directa a la tabla o vista
            return result.recordset; // Devuelve array de cursos para landing
        } catch (err) {
            throw err;
        }
    }

    async getCourseInfoForAdmin(courseId) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query(`
                        SELECT 
                            C.ID AS code,
                            C.title AS name,
                            C.description,
                            U.full_name AS instructor,
                            C.duration_in_hours AS duration,
                            CS.name AS status,
                            C.start_date AS startDate,
                            C.end_date AS endDate,
                            C.max_enrollment AS maximumCapacity,
                            M.name AS mode
                        FROM linkage.Courses C
                        LEFT JOIN linkage.Course_Instructors CI ON (CI.course_id = C.ID AND CI.is_titular = 1)
                        LEFT JOIN linkage.Users U ON (U.ID = CI.user_id)
                        LEFT JOIN (
                            SELECT CSH1.course_id, CSH1.status_id, CSH1.start_date
                            FROM linkage.Course_Status_History CSH1
                            INNER JOIN (
                                SELECT course_id, MAX(start_date) as max_date
                                FROM linkage.Course_Status_History
                                GROUP BY course_id
                            ) CSH2 ON CSH1.course_id = CSH2.course_id AND CSH1.start_date = CSH2.max_date
                        ) CSH ON CSH.course_id = C.ID
                        LEFT JOIN linkage.Course_Status CS ON (CS.ID = CSH.status_id)
                        LEFT JOIN linkage.Modalities M ON (M.ID = C.modality_id)
                        WHERE CS.name != 'En oferta' and C.ID = ${courseId};
                    `);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CoursesAdminModel();