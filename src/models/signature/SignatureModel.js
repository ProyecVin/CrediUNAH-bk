// src/models/signatures/SignatureModel.js
const sql = require('mssql');
const config = require('../../config/awsDB');

class SignatureModel {
  async getAllSignatures() {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM linkage.Signatures');
    return result.recordset;
  }

  async getSignatureById(id) {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM linkage.Signatures WHERE ID = @id');
    return result.recordset[0];
  }

  async createSignature(data) {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('signer_name', sql.NVarChar(255), data.signer_name)
      .input('signer_title', sql.NVarChar(255), data.signer_title)
      .input('operational_unit_id', sql.NVarChar(15), data.operational_unit_id)
      .input('signature_image_id', sql.Int, data.signature_image_id)
      .input('is_active', sql.Bit, data.is_active)
      .query(`
        INSERT INTO linkage.Signatures (signer_name, signer_title, operational_unit_id, signature_image_id, created_at, is_active)
        VALUES (@signer_name, @signer_title, @operational_unit_id, @signature_image_id, GETDATE(), @is_active)
      `);
    return result.rowsAffected[0] > 0;
  }

  async updateSignature(id, data) {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('signer_name', sql.NVarChar(255), data.signer_name)
      .input('signer_title', sql.NVarChar(255), data.signer_title)
      .input('operational_unit_id', sql.NVarChar(15), data.operational_unit_id)
      .input('signature_image_id', sql.Int, data.signature_image_id)
      .input('is_active', sql.Bit, data.is_active)
      .query(`
        UPDATE linkage.Signatures
        SET signer_name = @signer_name,
            signer_title = @signer_title,
            operational_unit_id = @operational_unit_id,
            signature_image_id = @signature_image_id,
            is_active = @is_active
        WHERE ID = @id
      `);
    return result.rowsAffected[0] > 0;
  }

  async deleteSignature(id) {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM linkage.Signatures WHERE ID = @id');
    return result.rowsAffected[0] > 0;
  }
}

module.exports = new SignatureModel();
