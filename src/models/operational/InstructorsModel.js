// src/models/operational/InstructorsModel.js
const sql = require('mssql');
const config = require('../../config/database');

class InstructorsModel {
    async getInstructorsByUnit(unitId) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('unitId', sql.Int, unitId)
                .query(`SELECT * FROM linkage.Course_Instructors WHERE course_id = @unitId`);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new InstructorsModel();