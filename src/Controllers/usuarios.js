//src/Controllers/usuarios.js
const UserModel = require ('../models/Usuario');

class UserController {
  async createUser(req, res) {
    try {
      const { nombre, apellido, correo } = req.body;
      const user = await UserModel.createUser(nombre, apellido, correo);
      res.status(201).json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async readUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.readUser(parseInt(id));
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, correo } = req.body;
      const rowsAffected = await UserModel.updateUser(parseInt(id), nombre, apellido, correo);
      if (rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const rowsAffected = await UserModel.deleteUser(parseInt(id));
      if (rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      if (users.length === 0) {
        return res.status(404).json({ message: 'No hay usuarios en la base de datos' });
      }
      res.json(users); // Devolver la lista de usuarios
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();