// src/middlewares/roleCheck.js
const userModel = require('../models/auth/userModel');

// Middleware para verificar roles de usuario
function roleCheck(rolesPermitidos) {
  return async function(req, res, next) {
    try {
      // Obtene correo del usuario desde el token JWT o Firebase
      const correo = req.user.email;
      
      // Obtene información del usuario desde la base de datos
      const userData = await userModel.getUserByEmail(correo);
      
      if (!userData) {
        return res.status(403).json({ 
          success: false,
          message: 'Usuario no registrado en el sistema' 
        });
      }
      
      // Verifica si el usuario está activo
      if (!userData.activo) {
        return res.status(403).json({ 
          success: false,
          message: 'La cuenta de usuario está desactivada' 
        });
      }
      
      // Verifica si el rol del usuario está entre los permitidos
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(userData.rol_nombre)) {
        return res.status(403).json({ 
          success: false,
          message: 'No tiene permisos para acceder a este recurso' 
        });
      }
      
      // aqui se agrega la información de la base de datos al objeto req.user todo lo que quiera agregar del usuario
      req.user.dbInfo = userData;
      next();
    } catch (error) {
      console.error('Error en middleware de verificación de roles:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  };
}

module.exports = roleCheck;
