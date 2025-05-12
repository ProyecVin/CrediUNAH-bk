//const supabase = require('../config/supabase');
// src/models/Usuario.js
const sql = require('mssql');
const config = require('../config/database')
const config = require('../config/awsDB')

class UserModel {
    async createUser(nombre, apellido, correo) {
      try {
        const pool = await sql.connect(config);
        const result = await pool.request()
          .input('nombre', sql.NVarChar(100), nombre)
          .input('apellido', sql.NVarChar(100), apellido)
          .input('correo', sql.NVarChar(255), correo)
          .execute('linkage.create_user');
        return result.recordset;
      } catch (err) {
        throw err;
      }
    }
  
    async readUser(id) {
      try {
        const pool = await sql.connect(config);
        const result = await pool.request()
          .input('id', sql.Int, id)
          .execute('linkage.read_user');
        return result.recordset[0];
      } catch (err) {
        throw err;
      }
    }
  
    async updateUser(id, nombre, apellido, correo) {
      try {
        const pool = await sql.connect(config);
        const result = await pool.request()
          .input('id', sql.Int, id)
          .input('nombre', sql.NVarChar(100), nombre)
          .input('apellido', sql.NVarChar(100), apellido)
          .input('correo', sql.NVarChar(255), correo)
          .execute('linkage.update_user');
        return result.rowsAffected;
      } catch (err) {
        throw err;
      }
    }
  
    async deleteUser(id) {
      try {
        const pool = await sql.connect(config);
        const result = await pool.request()
          .input('id', sql.Int, id)
          .execute('linkage.delete_user');
        return result.rowsAffected;
      } catch (err) {
        throw err;
      }
    }

    async getAllUsers() {
      try {
        const pool = await sql.connect(config);
        const result = await pool.request()
          .execute('linkage.get_all_users'); // Llamamos al procedimiento almacenado
        return result.recordset; // Regresa todos los usuarios en un array
      } catch (err) {
        throw err;
      }
    }
  }
  
  module.exports = new UserModel();