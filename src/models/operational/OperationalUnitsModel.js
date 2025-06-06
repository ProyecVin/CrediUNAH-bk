const sql = require('mssql');
const config = require('../../config/awsDB');



const OperationalUnitModel = {
  create: async ({ ID, name, is_active }) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('ID', sql.NVarChar(15), ID)
      .input('name', sql.NVarChar(100), name)
      .input('is_active', sql.Bit, is_active)
      .execute('linkage.sp_CreateOperationalUnit');
  },

  getAll: async () => {
    const pool = await sql.connect(config);
    return pool.request().execute('linkage.sp_GetAllOperationalUnits');
  },

  update: async ({ ID, name, is_active }) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('ID', sql.NVarChar(15), ID)
      .input('name', sql.NVarChar(100), name)
      .input('is_active', sql.Bit, is_active)
      .execute('linkage.sp_UpdateOperationalUnit');
  },

  delete: async (ID) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('ID', sql.NVarChar(15), ID)
      .execute('linkage.sp_DeleteOperationalUnit');
  },

  assignUser: async ({ user_id, operational_unit_id }) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('user_id', sql.NVarChar(15), user_id)
      .input('operational_unit_id', sql.NVarChar(15), operational_unit_id)
      .execute('linkage.sp_AssignUserToOperationalUnit');
  },

  removeUser: async ({ user_id, operational_unit_id }) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('user_id', sql.NVarChar(15), user_id)
      .input('operational_unit_id', sql.NVarChar(15), operational_unit_id)
      .execute('linkage.sp_RemoveUserFromOperationalUnit');
  },

  getByUser: async (user_id) => {
    const pool = await sql.connect(config);
    return pool.request()
      .input('user_id', sql.NVarChar(15), user_id)
      .execute('linkage.sp_GetOperationalUnitsByUser');
  },
};

module.exports = OperationalUnitModel;



