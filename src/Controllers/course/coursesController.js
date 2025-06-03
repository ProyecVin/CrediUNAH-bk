// File: src/controllers/course/coursesController.js
const courseModel = require('../../models/courses/courseModel');

/**
 * Crea un curso.
 * Soporta archivo de imagen subido como 'image' (req.file) si se usa multer.
 */
exports.createCourse = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    console.log('Archivo recibido:', req.file);
    const userId = req.user.id; // extraído del middleware de autenticación
    const data = {
      ...req.body,
      created_by: userId,
    };

    // Si viene una imagen (ej. desde multer), añade el buffer y el nombre original
    if (req.file) {
      data.imageFile = req.file.buffer;
      data.imageFileName = req.file.originalname;
    }

    await courseModel.createCourse(data);
    res.status(201).json({ message: 'Curso creado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Actualiza un curso.
 * Si viene imagen (req.file), se sube a S3 y reemplaza la URL.
 */
exports.updateCourse = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.imageFile = req.file.buffer;
      data.imageFileName = req.file.originalname;
    }

    await courseModel.updateCourse(req.params.id, data);
    res.status(200).json({ message: 'Curso actualizado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Obtiene todos los cursos activos.
 */
exports.getCourses = async (_req, res) => {
  try {
    const courses = await courseModel.getActiveCourses();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Elimina un curso (lógicamente).
 */
exports.deleteCourse = async (req, res) => {
  try {
    await courseModel.deleteCourse(req.params.id);
    res.status(200).json({ message: 'Curso eliminado lógicamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
