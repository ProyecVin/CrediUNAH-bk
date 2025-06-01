const EnrollmentModel = require('../../models/enrollments/EnrollmentModel');

class EnrollmentController {
  async gradeStudent(req, res) {
    try {
      const { student_id, course_id, grade, comments } = req.body;

      if (!student_id || !course_id || grade === undefined) {
        return res.status(400).json({ message: "Faltan datos: student_id, course_id y grade son requeridos." });
      }

      const success = await EnrollmentModel.upsertGrade({ student_id, course_id, grade, comments });

      if (success) {
        res.status(200).json({ message: "Calificación registrada o actualizada correctamente." });
      } else {
        res.status(500).json({ message: "Error al registrar la calificación." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new EnrollmentController();
