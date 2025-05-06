require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { conectarDB } = require('./config/aws');

const app = express();
const usuarios = require('./routes/routes');


conectarDB();
app.use(cors());
app.use(express.json());
app.use('/api', usuarios);

const port = process.env.PORT || 3000;



// Ruta de que funciona el backend
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});



app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});