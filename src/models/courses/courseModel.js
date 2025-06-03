// src/models/operational/Courses.js
const { getConnection, sql } = require('../../config/awsDB');
const { uploadFileToS3 } = require('../../utils/s3');   

/**
 * Crea un curso.
 * @param {Object} data            
 * @param {Buffer} [data.imageFile]
 * @param {string} [data.image]     
 * @returns {Promise<sql.IResult<any>>}
 */
async function createCourse(data) {
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


async function updateCourse(id, data) {
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



async function getActiveCourses() {
  const pool = await getConnection();
  const result = await pool.request().execute('linkage.sp_get_active_courses');
  return result.recordset;
}


async function deleteCourse(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('ID', sql.Int, id)
    .execute('linkage.sp_delete_course');
  return result;
}

/**
 * Devuelve el tipo SQL correspondiente al nombre de parámetro.
 */
function getSqlType(key) {
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

async function getInactiveCourses() {
  const pool = await getConnection();
  const result = await pool.request().execute('linkage.sp_get_inactive_courses');
  return result.recordset;
}


module.exports = {
  createCourse,
  updateCourse,
  getActiveCourses,
  deleteCourse,
  getInactiveCourses
};
