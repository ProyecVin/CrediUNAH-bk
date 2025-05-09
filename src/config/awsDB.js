// src/config/aws.js
require('dotenv').config();  


const sql = require('mssql');  
const config = {
  
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,  
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => {
    console.log('Conexión a la base de datos establecida');
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
  });

  module.exports = {
    sql,
    getConnection: async () => {
      if (poolConnect) {
        return pool;
      }
      throw new Error('No se pudo establecer la conexión a la base de datos');
    },

    closePool: async () => {
      try {
        await pool.close();
        console.log('Conexión a la base de datos cerrada');
      } catch (err) {
        console.error('Error al cerrar la conexión a la base de datos:', err);
      }
    }
  };
