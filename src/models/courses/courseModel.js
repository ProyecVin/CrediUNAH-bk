// src/models/operational/Courses.js
const sql = require('mssql');
const config = require('../../config/database');

class CourseModel {

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

    getCoursesForLanding = async () => {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .execute('linkage.get_courses_for_landing'); // Llamamos al procedimiento almacenado
            return result.recordset; // Devuelve array de cursos para landing
        } catch (err) {
            throw err;
        }
    }

    getCourseInfoForCertificates = async (courseId) => {  
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .query(`
                SELECT 
                    C.ID AS courseId, 
                    C.TITLE AS courseName, 
                    C.DESCRIPTION AS description, 
                    C.DURATION_IN_HOURS AS durationInHours, 
                    C.SKILLS AS skills,
                    OU.ID AS operationalUnitId, 
                    OU2.ID AS certifyingOpUnitId,
                    OU.NAME AS operationalUnitName,
                    OU2.NAME AS certifyingOpUnitName,
                    OU2.CERTIFICATES_ISSUED AS certifyingOpUnitCertificateIssued,
                    CS.ID AS statusId,
                    CS.NAME AS status,
                    CT.ID AS courseTypeId,
                    CT.NAME AS courseTypeName
                FROM 
                    LINKAGE.COURSES C
                    LEFT JOIN LINKAGE.OPERATIONAL_UNITS OU ON ( OU.ID = C.OPERATIONAL_UNIT_ID )
                    LEFT JOIN LINKAGE.OPERATIONAL_UNITS OU2 ON ( OU2.ID = C.CERTIFYING_OP_UNIT_ID )
                    LEFT JOIN LINKAGE.COURSE_STATUS_HISTORY CSH ON (CSH.COURSE_ID = C.ID)
                    LEFT JOIN LINKAGE.COURSE_STATUS CS ON (CS.ID = CSH.STATUS_ID)
                    LEFT JOIN LINKAGE.COURSE_TYPES CT ON (CT.ID = C.COURSE_TYPE_ID)
                WHERE C.ID = ${courseId} AND CSH.START_DATE = (
                    SELECT MAX( START_DATE )
                    FROM LINKAGE.COURSE_STATUS_HISTORY
                    WHERE COURSE_ID = ${courseId}
                );`);
            return result.recordset;        
        } catch (error) {
            return error;
        }
    }

    async getCourseById(id) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`SELECT * FROM linkage.Courses WHERE id = @id`);
            return result.recordset[0]; // Solo un curso
        } catch (err) {
            throw err;
        }
    }

    //es posible que este incorrecto(que campos modificamos y que campos no(el id supongo que no))
    async updateCourse(course) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, course.id) 
                .input('title', sql.NVarChar, course.title)
                .input('description', sql.NVarChar, course.description)
                .input('start_date', sql.DateTime, course.start_date)
                .input('end_date', sql.DateTime, course.end_date)
                .input('duration_in_hours', sql.Int, course.duration_in_hours)
                .input('has_microcredential', sql.Bit, course.has_microcfredential)
                .input('max_enrollment', sql.Int, course.max_enrollment)
                .input('created_at', sql.DateTime, course.created_at)
                .input('last_updated_at', sql.DateTime, course.last_updated_at)
                .input('image_id', sql.Int, course.image_id)
                .input('created_by', sql.Int, course.created_by)
                .input('operational_unit_id', sql.NVarChar, course.operational_unit_id)
                .input('modality_id', sql.Int, course.modality_id) 
                .query(`
                    UPDATE linkage.Courses 
                    SET title = @title,
                        description = @description,
                        start_date = @start_date,
                        end_date = @end_date,
                        duration_in_hours = @duration_in_hours,
                        has_microcredential = @has_microcredential,
                        max_enrollment = @max_enrollment,
                        created_at = @created_at,
                        last_updated_at = @last_updated_at,
                        image_id = @image_id,
                        created_by = @created_by,
                        operational_unit_id = @operational_unit_id,
                        modality_id = @modality_id
                    WHERE id = @id
                `);
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CourseModel();