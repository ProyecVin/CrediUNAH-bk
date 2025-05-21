const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFoundHandler, errorHandler } = require('./utils/errorHandler');

const { getConnection } = require('./config/awsDB');
const routes = require('./routes');

require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

getConnection();
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/api', routes);


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}



// Ruta principal de que funciona el backend
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

app.use(notFoundHandler);
app.use(errorHandler);


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