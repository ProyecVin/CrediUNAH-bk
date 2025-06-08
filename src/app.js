// src/app.js
const express = require('express');
const cors = require('cors');
const fileUpload = require("express-fileupload");
const morgan = require('morgan');
const helmet = require('helmet');

require('dotenv').config();
require('./utils/s3Client.js');
require('./utils/s3')

const { notFoundHandler, errorHandler } = require('./utils/errorHandler');
const { getConnection } = require('./config/awsDB');

const routes = require('./routes');

getConnection();

const test = require('./routes/test.router');
const req = require('express/lib/request');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', express.json(), routes);

app.use((fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads',
})));

app.use('/api', routes);
app.use('/test', test);

// Ruta principal de que funciona el backend
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  console.log('Cerrando el servidor...');
  
  const { closePool } = require('./config/awsDB');
  await closePool();
    
  process.exit(0);
});

module.exports = app;