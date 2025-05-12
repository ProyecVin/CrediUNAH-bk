// src/utils/tokenService.js
const { createToken, verifyToken } = require('../config/jwt');

// Generar token JWT para el usuario
function generateUserToken(userData) {
  const payload = {
    id: userData.id,
    email: userData.correo,
    nombre: userData.nombre,
    apellido: userData.apellido,
    rol: userData.rol_nombre
  };
  
  return createToken(payload);
}

// Extraer información del token
function extractTokenInfo(token) {
  const result = verifyToken(token);
  if (!result.valid) {
    throw new Error('Token inválido o expirado');
  }
  
  return result.decoded;
}

module.exports = {
  generateUserToken,
  extractTokenInfo
};