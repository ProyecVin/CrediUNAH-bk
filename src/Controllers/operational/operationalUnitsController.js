const OperationalUnitModel = require('../../models/operational/OperationalUnitsModel');
const OperationalUnitController = {
  create: async (req, res) => {
    try {
      const result = await OperationalUnitModel.create(req.body);
      res.status(201).json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const result = await OperationalUnitModel.getAll();
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const result = await OperationalUnitModel.update(req.body);
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await OperationalUnitModel.delete(req.params.id);
      res.json({ message: 'Unidad eliminada correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  assignUser: async (req, res) => {
    try {
      const result = await OperationalUnitModel.assignUser(req.body);
      res.json({ message: 'Usuario asignado correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  removeUser: async (req, res) => {
    try {
      const result = await OperationalUnitModel.removeUser(req.body);
      res.json({ message: 'Usuario removido correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getByUser: async (req, res) => {
    try {
      const result = await OperationalUnitModel.getByUser(req.params.user_id);
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = OperationalUnitController;
