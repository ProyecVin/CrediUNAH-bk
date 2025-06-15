const sql = require('mssql');
const config = require('../../config/database');

class CourseStatusHistoryModel {
    updateCourseStatus = async (courseId, statusId) => {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query(`
                        INSERT INTO linkage.Course_Status_History (course_id, status_id, start_date)
                        VALUES (${courseId}, ${statusId}, GETDATE());
                    `); 
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CourseStatusHistoryModel();