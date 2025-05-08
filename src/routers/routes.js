const express = require('express');
const router = express.Router();
//const UserController = require('../Controllers/usuarios');

const UserController = require('../controllers/usuarios');

router.post('/users', UserController.createUser);
router.get('/users/:id', UserController.readUser);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);
router.get('/users', UserController.getAllUsers);
module.exports = router;