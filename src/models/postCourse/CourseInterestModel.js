const sql = require('mssql');
const {getConnection} = require('../../config/awsDB');

const CourseInterestModel = {
  getAll: async () => {
    const pool = await getConnection();
    return pool.request().execute('linkage.GetAllCourseInterests');
  },

  getByCourse: async (courseId) => {
    const pool = await getConnection();
    return pool.request()
      .input('course_id', sql.Int, courseId)
      .execute('linkage.GetCourseInterestById');
  },

  create: async (data) => {
    const pool = await getConnection();
    return pool.request()
      .input('contact_name', sql.NVarChar(255), data.contact_name)
      .input('contact_email', sql.NVarChar(255), data.contact_email)
      .input('contact_phone', sql.NVarChar(50), data.contact_phone)
      .input('is_business_interest', sql.Bit, data.is_business_interest)
      .input('organization_name', sql.NVarChar(255), data.organization_name)
      .input('position', sql.NVarChar(255), data.position)
      .input('interest_reason', sql.NVarChar(sql.MAX), data.interest_reason)
      .input('source', sql.NVarChar(100), data.source)
      .input('course_id', sql.Int, data.course_id)
      .execute('linkage.InsertCourseInterest');
  },

  update: async (data) => {
    const pool = await getConnection();
    return pool.request()
      .input('ID', sql.Int, data.ID)
      .input('contact_name', sql.NVarChar(255), data.contact_name)
      .input('contact_email', sql.NVarChar(255), data.contact_email)
      .input('contact_phone', sql.NVarChar(50), data.contact_phone)
      .input('is_business_interest', sql.Bit, data.is_business_interest)
      .input('organization_name', sql.NVarChar(255), data.organization_name)
      .input('position', sql.NVarChar(255), data.position)
      .input('interest_reason', sql.NVarChar(sql.MAX), data.interest_reason)
      .input('source', sql.NVarChar(100), data.source)
      .input('course_id', sql.Int, data.course_id)
      .execute('linkage.UpdateCourseInterest');
  }
};

module.exports = CourseInterestModel;
