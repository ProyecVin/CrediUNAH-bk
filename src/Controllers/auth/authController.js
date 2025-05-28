// src/controllers/auth/authController.js
const userModel = require('../../models/auth/userModel');
const { firebaseAuth } = require('../../config/firebase');
const { createToken } = require('../../config/jwt');

exports.register = async (req, res) => {
  try {
    const { id, full_name, phone_number, email, password, rol_id } = req.body;

    // Verificar si el correo ya existe
    const emailExists = await userModel.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado',
      });
    }

    // Verificar si la identidad ya está registrada
    const userExists = await userModel.getUserById(id);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'La identidad ya está registrada',
      });
    }

    // Crear usuario en Firebase
    const firebaseUser = await firebaseAuth.createUser(email, password);

    // Crear usuario en SQL Server usando la identidad como ID
    await userModel.createUser(id, full_name, phone_number, email, rol_id);

    // Enviar email de verificación (opcional)
    if (process.env.SEND_VERIFICATION_EMAIL === 'true') {
      const signInResult = await firebaseAuth.signInWithEmailPassword(email, password);
      await firebaseAuth.sendEmailVerification(signInResult.idToken);
    }

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        uid: firebaseUser.uid,
        email,
        id,
      },
    });
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

// Controlador para el inicio de sesión

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica si el usuario existe en la base de datos
    const dbUser = await userModel.getUserByEmail(email);
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verifica si el usuario está activo
    if (!dbUser.is_active) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta está desactivada. Contacte al administrador.',
      });
    }

    // Autenticación con Firebase
    const firebaseLoginResult = await firebaseAuth.signInWithEmailPassword(email, password);

    // Crear token JWT
    const token = createToken({
      id: dbUser.user_id,
      email: dbUser.email,
      full_name: dbUser.full_name,
      rol: dbUser.role_name,
    });
    

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: dbUser.user_id,
          full_name: dbUser.full_name,
          email: dbUser.email,
          phone_number: dbUser.phone_number,
          rol: dbUser.role_name,
        },
        token: token,
        firebaseToken: firebaseLoginResult.idToken,
      },
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);

    const firebaseError = error.response?.data?.error?.message;

    if (firebaseError) {
      const messages = {
        'EMAIL_NOT_FOUND': 'Correo electrónico o contraseña incorrectos',
        'INVALID_PASSWORD': 'Correo electrónico o contraseña incorrectos',
        'USER_DISABLED': 'La cuenta ha sido deshabilitada',
        'TOO_MANY_ATTEMPTS_TRY_LATER': 'Demasiados intentos fallidos. Intente más tarde.',
      };

      return res.status(firebaseError === 'TOO_MANY_ATTEMPTS_TRY_LATER' ? 429 : 401).json({
        success: false,
        message: messages[firebaseError] || 'Error de autenticación',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message,
    });
  }
};



// Controlador para obtener el perfil del usuario
exports.getProfile = async (req, res) => {
  try {
    
    
    res.json({
      success: true,
      data: {
        id: req.user.dbInfo.id,
        nombre: req.user.dbInfo.nombre,
        apellido: req.user.dbInfo.apellido,email: req.user.dbInfo.correo,
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

exports.getProfile = async (req, res) => {
  try {
    const user = req.user.dbInfo;

    res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        rol: user.rol_nombre,
        register_at: user.register_at,
      },
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
      error: error.message,
    });
  }
};