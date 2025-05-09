// src/middlewares/auth.js
const { firebaseAuth } = require('../config/firebase');
const { verifyToken } = require('../config/jwt');

// Middleware para verificar token JWT o Firebase
async function authMiddleware(req, res, next) {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No se proporcionó token de autenticación' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Primero intentamos verificar con JWT
    const jwtResult = verifyToken(token);
    
    if (jwtResult.valid) {
      // Si el token JWT es válido
      req.user = jwtResult.decoded;
      return next();
    }
    
    // Si el JWT no es válido, intentamos con Firebase
    try {
      const decodedToken = await firebaseAuth.verifyToken(token);
      req.user = decodedToken;
      return next();
    } catch (firebaseError) {
      // Si tampoco es un token de Firebase válido
      return res.status(401).json({ 
        success: false,
        message: 'Token de autenticación inválido' 
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
}

module.exports = authMiddleware;
