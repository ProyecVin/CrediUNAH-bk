const sql = require('mssql');
const { getConnection } = require('../../config/awsDB');
//const config = require('../../config/awsDB');

class ModalityModel {
  async getAllModalities() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query('SELECT ID, name FROM linkage.Modalities WHERE is_active = 1');
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ModalityModel();
