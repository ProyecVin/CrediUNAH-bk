// src/models/operational/Courses.js

const { getConnection, sql } = require('../../config/awsDB');





// models/courseModel.js
async function createCourse(data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('title', sql.NVarChar(255), data.title)
    .input('skills', sql.NVarChar(30), data.skills)
    .input('description', sql.NVarChar(sql.MAX), data.description)
    .input('start_date', sql.Date, data.start_date)
    .input('end_date', sql.Date, data.end_date)
    .input('duration_in_hours', sql.Int, data.duration_in_hours)
    .input('has_microcredential', sql.Bit, data.has_microcredential)
    .input('max_enrollment', sql.Int, data.max_enrollment)
    .input('image_id', sql.Int, data.image_id)
    .input('created_by', sql.NVarChar(15), data.created_by)
    .input('operational_unit_id', sql.NVarChar(15), data.operational_unit_id)
    .input('certifying_op_unit_id', sql.NVarChar(15), data.certifying_op_unit_id)
    .input('modality_id', sql.Int, data.modality_id)
    .input('course_type_id', sql.Int, data.course_type_id)
    .execute('linkage.sp_create_course');
  return result;
}

async function updateCourse(id, data) {
  const pool = await getConnection();
  const request = pool.request().input('ID', sql.Int, id);
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      const sqlType = getSqlType(key);
      request.input(key, sqlType, value);
    }
  });
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
  const result = await pool.request().input('ID', sql.Int, id).execute('linkage.sp_delete_course');
  return result;
}

function getSqlType(key) {
  const typeMap = {
    title: sql.NVarChar(255),
    skills: sql.NVarChar(30),
    description: sql.NVarChar(sql.MAX),
    start_date: sql.Date,
    end_date: sql.Date,
    duration_in_hours: sql.Int,
    has_microcredential: sql.Bit,
    max_enrollment: sql.Int,
    image_id: sql.Int,
    created_by: sql.NVarChar(15),
    operational_unit_id: sql.NVarChar(15),
    certifying_op_unit_id: sql.NVarChar(15),
    modality_id: sql.Int,
    course_type_id: sql.Int,
  };
  return typeMap[key] || sql.NVarChar; // fallback
}

module.exports = {
  createCourse,
  updateCourse,
  getActiveCourses,
  deleteCourse
};
