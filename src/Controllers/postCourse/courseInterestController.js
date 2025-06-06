const CourseInterestModel = require('../../models/postCourse/CourseInterestModel');

const CourseInterestsController = {
  getAll: async (req, res) => {
    try {
      const result = await CourseInterestModel.getAll();
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getByCourse: async (req, res) => {
    try {
      const result = await CourseInterestModel.getByCourse(req.params.courseId);
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const result = await CourseInterestModel.create(req.body);
      res.status(201).json({ message: 'Interés registrado correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const result = await CourseInterestModel.update(req.body);
      res.json({ message: 'Interés actualizado correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = CourseInterestsController;
