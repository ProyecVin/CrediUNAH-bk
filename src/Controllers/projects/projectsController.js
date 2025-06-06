const ProjectsModel = require('../../models/projects/ProjectsModel');

const ProjectsController = {
  getAll: async (req, res) => {
    try {
      const result = await ProjectsModel.getAll();
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const { title, description } = req.body;
      const last_updated_at = new Date();

      await ProjectsModel.create({ title, description, last_updated_at });
      res.status(201).json({ message: 'Proyecto creado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = ProjectsController;
