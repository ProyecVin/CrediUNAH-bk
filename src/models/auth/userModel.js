// src/models/userModel.js
const { getConnection, sql } = require('../../config/awsDB');

class UserModel {
  // Crea un nuevo usuario en la base de datos
  async createUser(nombre, apellido, correo, telefono, rol_id) {
    try {
      const pool = await getConnection();
      const request = pool.request();
      
      request.input("nombre", sql.NVarChar, nombre);
      request.input("apellido", sql.NVarChar, apellido);
      request.input("correo", sql.NVarChar, correo);
      request.input("telefono", sql.NVarChar, telefono || null);
      request.input("rol_id", sql.Int, rol_id);
      
      await request.execute("linkage.spCrearUsuario");
      return true;
    } catch (error) {
      console.error('Error en modelo al crear usuario:', error);
      throw error;
    }
  }

  // Obtenie usuario por correo electrónico solo es una prueba
  async getUserByEmail(correo) {
    try {
      const pool = await getConnection();
      const request = pool.request();
      
      request.input("correo", sql.NVarChar, correo);
      const result = await request.execute("linkage.spObtenerUsuarioPorCorreo");
      
      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      }
      return null;
    } catch (error) {
      console.error('Error en modelo al obtener usuario por email:', error);
      throw error;
    }
  }

  // Verifica si un correo ya existe 
  async emailExists(correo) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('correo', sql.NVarChar, correo)
        .query('SELECT COUNT(*) AS count FROM linkage.usuario WHERE correo = @correo');
      
      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error al verificar email:', error);
      throw error;
    }
  }

  // Actualiza estado de activación de usuario
  async updateUserStatus(userId, isActive) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('activo', sql.Bit, isActive ? 1 : 0)
        .query('UPDATE linkage.usuario SET activo = @activo WHERE id = @userId');
      
      return true;
    } catch (error) {
      console.error('Error al actualizar estado del usuario:', error);
      throw error;
    }
  }
}

module.exports = new UserModel();