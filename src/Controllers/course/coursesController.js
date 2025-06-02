// src/Controllers/operational/courses.js

const courseModel = require('../../models/courses/courseModel');

exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id; // extraído del middleware de autenticación
    const data = { ...req.body, created_by: userId };
    await courseModel.createCourse(data);
    res.status(201).json({ message: 'Curso creado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    await courseModel.updateCourse(req.params.id, req.body);
    res.status(200).json({ message: 'Curso actualizado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourses = async (_req, res) => {
  try {
    const courses = await courseModel.getActiveCourses();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await courseModel.deleteCourse(req.params.id);
    res.status(200).json({ message: 'Curso eliminado lógicamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
