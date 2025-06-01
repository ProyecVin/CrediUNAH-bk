// src/middlewares/validation.js
const { UserRegisterValidation, UserLoginValidation, validateSqlInjection } = require('../models/validations/userValidation');

// Middleware para validar datos de registro
function validateRegister(req, res, next) {
  try {
    // Comprobar existencia del body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron datos'
      });
    }
    
    // Valida posibles inyecciones SQL en todos los campos
    for (let key in req.body) {
      if (validateSqlInjection(req.body[key])) {
        return res.status(400).json({
          success: false,
          message: 'Los datos contienen caracteres no permitidos'
        });
      }
    }
    
    // Valida datos de registro
    const validator = new UserRegisterValidation(req.body);
    const errors = validator.validate();
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en validación de registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Middleware para validar datos de login
function validateLogin(req, res, next) {
  try {
    // Comprobar existencia del body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron datos'
      });
    }
    
    // Validar posibles inyecciones SQL
    for (let key in req.body) {
      if (validateSqlInjection(req.body[key])) {
        return res.status(400).json({
          success: false,
          message: 'Los datos contienen caracteres no permitidos'
        });
      }
    }
    
    // Validar datos de login
    const validator = new UserLoginValidation(req.body);
    const errors = validator.validate();
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en validación de login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
  validateRegister,
  validateLogin
};