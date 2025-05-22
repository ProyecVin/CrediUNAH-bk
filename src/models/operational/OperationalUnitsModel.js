// src/models/operational/OperationalUnits.js
const sql = require('mssql');
const config = require('../../config/awsDB');

class OperationalUnitsModel {
    async getAllOperationalUnits() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query('SELECT * FROM linkage.Operational_Units'); // Consulta directa a la tabla
            return result.recordset; // Devuelve array de unidades operacionales
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new OperationalUnitsModel();
