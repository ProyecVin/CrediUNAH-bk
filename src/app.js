const express = require('express');
const cors = require('cors');
const fileUpload = require("express-fileupload");
const morgan = require('morgan');
const helmet = require('helmet');

const { notFoundHandler, errorHandler } = require('./utils/errorHandler');
const { conectarDB, getConnection } = require('./config/awsDB');

require('dotenv').config();
require('./services/s3.service.js');

const routes = require('./routes');
const usuarios = require('./routes/routes.js');
const test = require('./routes/test.router.js');
const req = require('express/lib/request.js');

const app = express();

getConnection();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads',
})));

app.use('/api', routes);


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(morgan('dev')); // Show the logs in the console

app.use('/api', usuarios);
app.use('/test', test);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 3000;

// Ruta principal de que funciona el backend
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  console.log('Cerrando el servidor...');
  
  const { closePool } = require('./config/awsDB');
  await closePool();
    
  process.exit(0);
}

);
module.exports = app;