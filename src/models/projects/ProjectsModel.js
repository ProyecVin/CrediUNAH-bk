const sql = require('mssql');
const config = require('../../config/awsDB');

const ProjectsModel = {
  getAll: async () => {
    const pool = await sql.connect(config);
    return pool.request().execute('linkage.GetAllProjects');
  },

  create: async ({ title, description, last_updated_at }) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('title', sql.NVarChar(200), title)
      .input('description', sql.Text, description)
      .input('last_updated_at', sql.DateTime, last_updated_at)
      .execute('linkage.InsertProject');
  },
};

module.exports = ProjectsModel;
