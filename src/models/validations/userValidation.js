// src/models/validations/userValidation.js
const validator = require('validator');

// Clase para validar datos de registro de usuario
class UserRegisterValidation {
  constructor(data) {
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.correo = data.correo;
    this.telefono = data.telefono;
    this.password = data.password;
    this.rol_id = data.rol_id;
  }

  validate() {
    const errors = [];

    // Validación de campos requeridos
    if (!this.nombre) errors.push('El nombre es requerido');
    if (!this.apellido) errors.push('El apellido es requerido');
    if (!this.correo) errors.push('El correo electrónico es requerido');
    if (!this.password) errors.push('La contraseña es requerida');
    if (!this.rol_id) errors.push('El rol es requerido');
    
    // Validación de email
    if (this.correo && !validator.isEmail(this.correo)) {
      errors.push('El correo electrónico es inválido');
    }

    // Validación de teléfono (opcional)
    if (this.telefono && !validator.isMobilePhone(this.telefono, 'any', { strictMode: false })) {
      errors.push('El número de teléfono es inválido');
    }

    // Validación de contraseña
    if (this.password) {
      if (this.password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
      }
      if (!/[A-Z]/.test(this.password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula');
      }
      if (!/[\W_]/.test(this.password)) {
        errors.push('La contraseña debe contener al menos un carácter especial');
      }
      if (!/\d/.test(this.password)) {
        errors.push('La contraseña debe contener al menos un número');
      }
      if (/012|123|234|345|456|567|678|789|890/.test(this.password)) {
        errors.push('La contraseña no debe contener secuencias numéricas');
      }
    }

    return errors;
  }
}

// Clase para validar datos de inicio de sesión
class UserLoginValidation {
  constructor(data) {
    this.correo = data.correo;
    this.password = data.password;
  }

  validate() {
    const errors = [];

    // Validación de campos requeridos
    if (!this.correo) errors.push('El correo electrónico es requerido');
    if (!this.password) errors.push('La contraseña es requerida');
    
    // Validación de email
    if (this.correo && !validator.isEmail(this.correo)) {
      errors.push('El correo electrónico es inválido');
    }

    return errors;
  }
}

// Función para detectar posibles intentos de inyección SQL
function validateSqlInjection(data) {
  // Palabras clave peligrosas específicas de SQL
  const dangerousKeywords = ['exec', 'select', 'insert', 'delete', 'update', 'drop', 'alter', 'truncate'];
  
  // Caracteres peligrosos 
  const dangerousChars = ["'", ';', '--', '/*', '*/', '@@', '`', '"'];

  if (typeof data === 'string') {
    // Convertir a minúsculas para hacer la búsqueda insensible a mayúsculas
    const lowerData = data.toLowerCase();
    
    // Si contiene alguna palabra clave peligrosa
    if (dangerousKeywords.some(keyword => lowerData.includes(keyword))) {
      return true;
    }
    
    // Si contiene caracteres peligrosos
    if (dangerousChars.some(char => data.includes(char))) {
      return true;
    }
  }
  return false;
}

module.exports = { 
  UserRegisterValidation, 
  UserLoginValidation,
  validateSqlInjection 
};