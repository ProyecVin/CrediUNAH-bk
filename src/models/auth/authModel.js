//src/models/authModels/authModel.js
const sql = require("mssql");

async function createUser(nombre, apellido, correo, telefono, rol_id) {
  const request = new sql.Request();
  request.input("nombre", sql.NVarChar, nombre);
  request.input("apellido", sql.NVarChar, apellido);
  request.input("correo", sql.NVarChar, correo);
  request.input("telefono", sql.NVarChar, telefono);
  request.input("rol_id", sql.Int, rol_id);
  await request.execute("linkage.spCrearUsuario");
}

async function getUserByEmail(correo) {
  const request = new sql.Request();
  request.input("correo", sql.NVarChar, correo);
  const result = await request.execute("linkage.spObtenerUsuarioPorCorreo");
  return result.recordset[0];
}

module.exports = { createUser, getUserByEmail };
