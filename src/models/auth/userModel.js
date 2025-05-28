// src/models/userModel.js



const { getConnection, sql } = require('../../config/awsDB');

class UserModel {
  // Crear un nuevo usuario
  async createUser(id, fullName, phoneNumber, email, roleId) {
    try {
      const pool = await getConnection();
      const request = pool.request();

      request.input("id", sql.NVarChar(15), id);
      request.input("full_name", sql.NVarChar(150), fullName);
      request.input("phone_number", sql.NVarChar(20), phoneNumber || null);
      request.input("email", sql.NVarChar(255), email);
      request.input("rol_id", sql.Int, roleId);

      await request.execute("linkage.spCreateUsers");
      return true;
    } catch (error) {
      console.error("Error en modelo al crear usuario:", error);
      throw error;
    }
  }

  // Obtener un usuario por correo electrónico
  async getUserByEmail(email) {
    try {
      const pool = await getConnection();
      const request = pool.request();

      request.input("correo", sql.NVarChar(255), email);
      const result = await request.execute("linkage.spLogin");

      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      }

      return null;
    } catch (error) {
      console.error("Error en modelo al obtener usuario por email:", error);
      throw error;
    }
  }

  // Verifica si un correo ya existe
  async emailExists(email) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input("correo", sql.NVarChar(255), email)
        .query("SELECT COUNT(*) AS count FROM linkage.Users WHERE email = @correo");

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error("Error al verificar email:", error);
      throw error;
    }
  }

  async getUserById(id) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.NVarChar(15), id) 
      .query("SELECT COUNT(*) AS count FROM linkage.Users WHERE id = @id");

    return result.recordset[0].count > 0;
  } catch (error) {
    console.error("Error al verificar ID:", error);
    throw error;
  }
}



  // Actualiza estado de activación de usuario
  async updateUserStatus(userId, isActive) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input("userId", sql.NVarChar(15), userId)
        .input("is_active", sql.Bit, isActive ? 1 : 0)
        .query("UPDATE linkage.Users SET is_active = @is_active WHERE ID = @userId");

      return true;
    } catch (error) {
      console.error("Error al actualizar estado del usuario:", error);
      throw error;
    }
  }
}

module.exports = new UserModel();
