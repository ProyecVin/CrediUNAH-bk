// src/config/aws.js
require('dotenv').config();  // Cargar el archivo .env


const sql = require('mssql');  // Asegúrate de tener mssql instalado
const config = {
  
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,  // Asegúrate de que esta opción esté habilitada
  }
};

console.log('CONFIGURACIÓN DE CONEXIÓN:', JSON.stringify(config, null, 2));  // Esto te ayudará a verificar si las variables están siendo leídas correctamente
console.log('Valor de server:', process.env.DB_SERVER);
console.log('Type of DB_SERVER:', typeof process.env.DB_SERVER);
async function conectarDB() {
  try {
    await sql.connect(config);
    console.log(' Conexión exitosa a SQL Server');
  } catch (err) {
    console.error(' Error de conexión:', err);
    console.error('Detalles del error:', err.message);  // Esto dará detalles sobre la causa
    console.error('Código de error:', err.code);  // Información adicional
  }
}

module.exports = { conectarDB };
