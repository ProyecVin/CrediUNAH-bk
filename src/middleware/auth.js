// src/middlewares/auth.js
const { firebaseAuth } = require('../config/firebase');
const { verifyToken } = require('../config/jwt');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No se proporcionó token de autenticación' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar JWT
    const jwtResult = verifyToken(token);
    if (jwtResult.valid) {
      req.user = {
        id: jwtResult.decoded.userId || jwtResult.decoded.id || jwtResult.decoded.uid
      };
      return next();
    }

    // Verificar Firebase
    try {
      const decodedToken = await firebaseAuth.verifyToken(token);
      req.user = {
        id: decodedToken.uid || decodedToken.user_id // adaptado a Firebase
      };
      return next();
    } catch (firebaseError) {
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
