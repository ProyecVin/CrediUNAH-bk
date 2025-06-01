//src/models/validations/userValidation.js
const validator = require('validator');

// Clase para validar datos de registro de usuario
class UserRegisterValidation {
  constructor(data) {
    this.id = data.id;
    this.full_name = data.full_name || `${data.nombre || ''} ${data.apellido || ''}`.trim();
    this.telefono = data.phone_number || data.telefono;
    this.correo = data.email || data.correo;
    this.password = data.password;
    this.rol_id = data.rol_id;
  }

  validate() {
    const errors = [];

    // Validaciones requeridas
    if (!this.id) errors.push('La identidad (ID) es requerida');
    if (!this.full_name) errors.push('El nombre completo es requerido');
    if (!this.correo) errors.push('El correo electrónico es requerido');
    if (!this.password) errors.push('La contraseña es requerida');
    if (!this.rol_id) errors.push('El rol es requerido');

    // Validación de identidad (longitud y formato)
    if (this.id && !/^\d{13}$/.test(this.id)) {
      errors.push('La identidad debe tener 13 dígitos numéricos');
    }

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
    this.correo = data.email || data.correo;
    this.password = data.password;
  }

  validate() {
    const errors = [];

    if (!this.correo) errors.push('El correo electrónico es requerido');
    if (!this.password) errors.push('La contraseña es requerida');

    if (this.correo && !validator.isEmail(this.correo)) {
      errors.push('El correo electrónico es inválido');
    }

    return errors;
  }
}

// Función para detectar posibles intentos de inyección SQL
function validateSqlInjection(data) {
  const dangerousKeywords = ['exec', 'select', 'insert', 'delete', 'update', 'drop', 'alter', 'truncate'];
  const dangerousChars = ["'", ';', '--', '/*', '*/', '@@', '`', '"'];

  if (typeof data === 'string') {
    const lowerData = data.toLowerCase();
    if (dangerousKeywords.some(keyword => lowerData.includes(keyword))) return true;
    if (dangerousChars.some(char => data.includes(char))) return true;
  }
  return false;
}

module.exports = { 
  UserRegisterValidation, 
  UserLoginValidation,
  validateSqlInjection 
};
