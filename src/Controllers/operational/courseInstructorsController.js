// src/Controllers/operational/instructorsController.js
/*const InstructorsModel = require('../../models/operational/InstructorsModel');

class InstructorsController {
    async getInstructorsByUnit(req, res) {
        try {
            const { unitId } = req.params;
            const instructors = await InstructorsModel.getInstructorsByUnit(unitId);
            
            if (instructors.length === 0) {
                return res.status(404).json({ message: 'No se encontraron instructores para esta unidad operativa' });
            }

            res.json(instructors);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new InstructorsController();*/

const CourseInstructorsModel = require('../../models/operational/CourseInstructorsModel');

const CourseInstructorsController = {
  getAll: async (req, res) => {
    try {
      const result = await CourseInstructorsModel.getAll();
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getByCourse: async (req, res) => {
    try {
      const result = await CourseInstructorsModel.getByCourse(req.params.courseId);
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getByInstructor: async (req, res) => {
    try {
      const result = await CourseInstructorsModel.getByInstructor(req.params.userId);
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  assign: async (req, res) => {
    try {
      const result = await CourseInstructorsModel.assign(req.body);
      res.status(201).json({ message: 'Instructor asignado correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const result = await CourseInstructorsModel.update({ ID: req.params.id, ...req.body });
      res.json({ message: 'Asignación actualizada correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const result = await CourseInstructorsModel.remove(req.params.id);
      res.json({ message: 'Asignación eliminada correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = CourseInstructorsController;
