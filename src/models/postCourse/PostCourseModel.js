
const sql = require('mssql');
const config = require('../../config/awsDB');

class CourseModel {
    async createCourse(courseData) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('title', sql.NVarChar(255), courseData.title)
                .input('description', sql.NVarChar(sql.MAX), courseData.description)
                .input('start_date', sql.Date, courseData.start_date)
                .input('end_date', sql.Date, courseData.end_date)
                .input('duration_in_hours', sql.Int, courseData.duration_in_hours)
                .input('has_microcredential', sql.Bit, courseData.has_microcredential)
                .input('max_enrollment', sql.Int, courseData.max_enrollment)
                .input('created_at', sql.DateTime, new Date())
                .input('last_updated_at', sql.DateTime, new Date())
                .input('image_id', sql.Int, courseData.image_id)
                .input('created_by', sql.NVarChar(15), courseData.created_by)
                .input('operational_unit_id', sql.NVarChar(15), courseData.operational_unit_id)
                .input('modality_id', sql.Int, courseData.modality_id)
                .query(`
                    INSERT INTO linkage.Courses (
                        title, description, start_date, end_date, duration_in_hours,
                        has_microcredential, max_enrollment, created_at, last_updated_at,
                        image_id, created_by, operational_unit_id, modality_id
                    )
                    VALUES (
                        @title, @description, @start_date, @end_date, @duration_in_hours,
                        @has_microcredential, @max_enrollment, @created_at, @last_updated_at,
                        @image_id, @created_by, @operational_unit_id, @modality_id
                    )
                `);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CourseModel();
