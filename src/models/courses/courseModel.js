// src/models/operational/Courses.js
const { sql } = require('mssql');
const config = require('../../config/database');
const { getConnection } = require('../../config/awsDB');
const { uploadFileToS3 } = require('../../utils/s3');  

class CourseModel { 

    /**
     * Crea un curso.
     * @param {Object} data            
     * @param {Buffer} [data.imageFile]
     * @param {string} [data.image]     
     * @returns {Promise<sql.IResult<any>>}
     */
    createCourse = async (data) => {
      // --- Subir a S3 (opcional) ---------------------------------------------
      let imageUrl = data.image || null;
      if (data.imageFile && !imageUrl) {
        imageUrl = await uploadFileToS3(data.imageFile, data.imageFileName || 'image.jpg');
      }
      // ------------------------------------------------------------------------

      const pool = await getConnection();
      const result = await pool.request()
        .input('title',              sql.NVarChar(255), data.title)
        .input('skills',             sql.NVarChar(30),  data.skills)
        .input('description',        sql.NVarChar(sql.MAX), data.description)
        .input('start_date',         sql.Date,         data.start_date)
        .input('end_date',           sql.Date,         data.end_date)
        .input('duration_in_hours',  sql.Int,          data.duration_in_hours)
        .input('has_microcredential',sql.Bit,          data.has_microcredential)
        .input('max_enrollment',     sql.Int,          data.max_enrollment)
        .input('image',              sql.NVarChar(255), imageUrl)          // <-- cambio
        .input('created_by',         sql.NVarChar(15), data.created_by)
        .input('operational_unit_id',sql.NVarChar(15), data.operational_unit_id)
        .input('certifying_op_unit_id',sql.NVarChar(15), data.certifying_op_unit_id)
        .input('modality_id',        sql.Int,          data.modality_id)
        .input('course_type_id',     sql.Int,          data.course_type_id)
        .execute('linkage.sp_create_course');
      return result;
    }

    /**
     * Actualiza un curso.
     * Si mandas imageFile se sube a S3 y se cambia la URL; si mandas image solo la asigna.
     */
    /*
    async function updateCourse(id, data) {
      let imageUrl = data.image || undefined;

      if (data.imageFile && !imageUrl) {
        imageUrl = await uploadFileToS3(data.imageFile, data.imageFileName || 'image.jpg');
      }

      const pool = await getConnection();
      const request = pool.request().input('ID', sql.Int, id);

      // Preparar los campos dinámicos
      const updateData = { ...data, image: imageUrl };
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          const sqlType = getSqlType(key);
          request.input(key, sqlType, value);
        }
      });

      const result = await request.execute('linkage.sp_update_course');
      return result;
    }*/


    updateCourse = async(id, data) => {
      let imageUrl = data.image || undefined;

      if (data.imageFile && !imageUrl) {
        imageUrl = await uploadFileToS3(data.imageFile, data.imageFileName || 'image.jpg');
      }

      const allowedFields = {
        title:                 sql.NVarChar(255),
        skills:                sql.NVarChar(30),
        description:           sql.NVarChar(sql.MAX),
        start_date:            sql.Date,
        end_date:              sql.Date,
        duration_in_hours:     sql.Int,
        has_microcredential:   sql.Bit,
        max_enrollment:        sql.Int,
        image:                 sql.NVarChar(255),
        created_by:            sql.NVarChar(15),
        operational_unit_id:   sql.NVarChar(15),
        certifying_op_unit_id: sql.NVarChar(15),
        modality_id:           sql.Int,
        course_type_id:        sql.Int,
      };

      const updateData = {};
      if (imageUrl) updateData.image = imageUrl;

      for (const [key, value] of Object.entries(data)) {
        if (allowedFields[key] && value !== undefined) {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error("Debe enviar al menos un campo válido para actualizar.");
      }

      const pool = await getConnection();
      const request = pool.request().input('ID', sql.Int, id);

      for (const [key, value] of Object.entries(updateData)) {
        request.input(key, allowedFields[key], value);
      }

      const result = await request.execute('linkage.sp_update_course');
      return result;
    }



    getActiveCourses = async () => {
      const pool = await getConnection();
      const result = await pool.request().execute('linkage.sp_get_active_courses');
      return result.recordset;
    }


    deleteCourse = async (id) => {
      const pool = await getConnection();
      const result = await pool.request()
        .input('ID', sql.Int, id)
        .execute('linkage.sp_delete_course');
      return result;
    }

    /**
     * Devuelve el tipo SQL correspondiente al nombre de parámetro.
     */
    getSqlType = (key) => {
      const typeMap = {
        title:                 sql.NVarChar(255),
        skills:                sql.NVarChar(30),
        description:           sql.NVarChar(sql.MAX),
        start_date:            sql.Date,
        end_date:              sql.Date,
        duration_in_hours:     sql.Int,
        has_microcredential:   sql.Bit,
        max_enrollment:        sql.Int,
        image:                 sql.NVarChar(255),  
        created_by:            sql.NVarChar(15),
        operational_unit_id:   sql.NVarChar(15),
        certifying_op_unit_id: sql.NVarChar(15),
        modality_id:           sql.Int,
        course_type_id:        sql.Int,
      };
      return typeMap[key] || sql.NVarChar;
    }

    getInactiveCourses = async () => {
      const pool = await getConnection();
      const result = await pool.request().execute('linkage.sp_get_inactive_courses');
      return result.recordset;
    }

    getCoursesForLanding = async () => {
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

    getCourseById = async (id) => {
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

}

module.exports = new CourseModel();