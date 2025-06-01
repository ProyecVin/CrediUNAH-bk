// src/utils/tokenService.js
const { createToken, verifyToken } = require('../config/jwt');

// Generar token JWT para el usuario
function generateUserToken(userData) {
  const payload = {
   
    id: userData.user_id,
    email: userData.email,
    full_name: userData.full_name,
    rol: userData.role_name,
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