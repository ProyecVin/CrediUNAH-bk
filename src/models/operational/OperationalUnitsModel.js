const sql = require('mssql');
const config = require('../../config/awsDB')
const { getConnection } = require('../../config/awsDB');

class OperationalUnitsModel {
    getAllOperationalUnits = async () => {
      try {
        const pool = await sql.connect(config);
        const result = await pool.request()
          .execute('linkage.get_all_operational_units'); // Llamamos al procedimiento almacenado
        return result.recordset; // Regresa todos los unidades operacionales(Facultades) en un array
      } catch (err) {
        throw err;
      }
    }

     updateIssuedCertificatesAccount = async (opUnitId, newCount) => {  
             try {
                 const pool = await getConnection();
                 const result = await pool.request()
                 .query(`
                     update linkage.Operational_Units set certificates_issued = ${newCount} where id = '${opUnitId}'
                     `);
                 return result.recordset;        
             } catch (error) {
                 return error;
             }
         }
  }

module.exports = new OperationalUnitsModel();
