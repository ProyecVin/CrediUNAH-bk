const sql = require('mssql');
const config = require('../../config/awsDB')



class OperationalUnitsModel {
    async getAllOperationalUnits() {
      try {
        const pool = await sql.connect(config);
        const result = await pool.request()
          .execute('linkage.get_all_operational_units'); // Llamamos al procedimiento almacenado
        return result.recordset; // Regresa todos los unidades operacionales(Facultades) en un array
      } catch (err) {
        throw err;
      }
    }
  }
  
  module.exports = new OperationalUnitsModel();