// src/controllers/auth/authController.js
const userModel = require('../../models/auth/userModel');
const { firebaseAuth } = require('../../config/firebase');
const { createToken } = require('../../config/jwt');

// Controlador para el registro de usuarios
exports.register = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, password, rol_id } = req.body;

    // Verificar si el correo ya existe en la base de datos
    const emailExists = await userModel.emailExists(correo);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Crear usuario en Firebase
    const firebaseUser = await firebaseAuth.createUser(correo, password);
    
    // Crear usuario en la base de datos SQL Server
    await userModel.createUser(nombre, apellido, correo, telefono, rol_id);
    
    // Envia email de verificación
    if (process.env.SEND_VERIFICATION_EMAIL === 'true') {
      // Obtener el token de Firebase para el usuario recién creado
      const signInResult = await firebaseAuth.signInWithEmailPassword(correo, password);
      await firebaseAuth.sendEmailVerification(signInResult.idToken);
    }
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        uid: firebaseUser.uid,
        email: correo
      }
    });
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// Controlador para el inicio de sesión
exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    // Verifica si el usuario existe en la base de datos
    const dbUser = await userModel.getUserByEmail(correo);
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verifica si el usuario está activo
    if (!dbUser.activo) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta está desactivada. Contacte al administrador.'
      });
    }
    
    // Autenticar con Firebase
    const firebaseLoginResult = await firebaseAuth.signInWithEmailPassword(correo, password);
    
    // Crear token JWT con información del usuario
    const token = createToken({
      id: dbUser.id,
      email: dbUser.correo,
      nombre: dbUser.nombre,
      apellido: dbUser.apellido,
      rol: dbUser.rol_nombre
    });
    
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: dbUser.id,
          nombre: dbUser.nombre,
          apellido: dbUser.apellido,
          correo: dbUser.correo,
          telefono: dbUser.telefono,
          rol: dbUser.rol_nombre
        },
        token: token,
        firebaseToken: firebaseLoginResult.idToken
      }
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    
    // Errores específicos de Firebase
    if (error.response?.data?.error?.message) {
      const firebaseError = error.response.data.error.message;
      
      if (firebaseError === 'EMAIL_NOT_FOUND' || firebaseError === 'INVALID_PASSWORD') {
        return res.status(401).json({
          success: false,
          message: 'Correo electrónico o contraseña incorrectos'
        });
      }
      
      if (firebaseError === 'USER_DISABLED') {
        return res.status(403).json({
          success: false,
          message: 'La cuenta ha sido deshabilitada'
        });
      }
      
      if (firebaseError === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
        return res.status(429).json({
          success: false,
          message: 'Demasiados intentos fallidos. Intente más tarde.'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Controlador para obtener el perfil del usuario
exports.getProfile = async (req, res) => {
  try {
    // La información del usuario ya está disponible en req.user.dbInfo
    // esta info se trae desde el middleware roleCheck
    
    res.json({
      success: true,
      data: {
        id: req.user.dbInfo.id,
        nombre: req.user.dbInfo.nombre,
        apellido: req.user.dbInfo.apellido,
        correo: req.user.dbInfo.correo,
        telefono: req.user.dbInfo.telefono,
        rol: req.user.dbInfo.rol_nombre,
        fecha_registro: req.user.dbInfo.fecha_registro
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
      error: error.message
    });
  }
};