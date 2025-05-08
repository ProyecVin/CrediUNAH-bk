require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require("express-fileupload");
const morgan = require('morgan');

const { conectarDB } = require('./config/database');
require('./services/s3.service.js'); // Asegúrate de que este archivo exista y esté configurado correctamente

const app = express();

// Routers
const usuarios = require('./routers/routes.js');
const test = require('./routers/test.router.js');
const req = require('express/lib/request.js');

// conectarDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use((fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads',
})));

app.use(morgan('dev')); // Show the logs in the console

app.use('/api', usuarios);
app.use('/test', test);

const port = process.env.PORT || 3000;

// Ruta de que funciona el backend
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});