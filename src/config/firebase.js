
// src/config/firebase.js
const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();

// Define las credenciales desde las variables de entorno
const serviceAccountFromEnv = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

const apiKey = process.env.FIREBASE_API_KEY;

// Inicializa Firebase Admin solo una vez
if (!admin.apps.length) {
  try {
    // Intenta usar serviceAccountFromEnv si no hay archivo local
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountFromEnv)
    });
    console.log('Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
    throw error;
  }
}

// Funciones para interactuar con Firebase Auth
const firebaseAuth = {
  // Crea usuario en Firebase
  async createUser(email, password) {
    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        emailVerified: false
      });
      return userRecord;
    } catch (error) {
      console.error('Error al crear usuario en Firebase:', error);
      throw error;
    }
  },

  // Verifica token de Firebase
  async verifyToken(token) {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  },

  // Inicia sesión con email y contraseña
  async signInWithEmailPassword(email, password) {
    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          email: email,
          password: password,
          returnSecureToken: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error en autenticación Firebase:', error.response?.data || error.message);
      throw error;
    }
  },

  // Envia email de verificación
  async sendEmailVerification(idToken) {
    try {
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          requestType: 'VERIFY_EMAIL',
          idToken: idToken
        }
      );
      return true;
    } catch (error) {
      console.error('Error al enviar email de verificación:', error.response?.data || error.message);
      throw error;
    }
  },

  // Envía correo de recuperación de contraseña
  async sendPasswordResetEmail(email) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        requestType: 'PASSWORD_RESET',
        email: email,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento de contraseña:', error.response?.data || error.message);
    throw error;
  }
}

};

module.exports = {
  admin,
  firebaseAuth
  

};

