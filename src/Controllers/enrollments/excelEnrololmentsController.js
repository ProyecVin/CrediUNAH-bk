const xlsx = require('xlsx');
const ExcelEnrollmentsModel = require('../../models/enrollments/excelEnrollmentsModel');

const ExcelEnrollmentsController = {
  uploadGradesExcel: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se envió un archivo.' });
      }

      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      for (const row of data) {
        await ExcelEnrollmentsModel.updateGradeFromExcel({
          student_id: row.student_id,
          course_id: parseInt(row.course_id),
          grade: parseFloat(row.grade),
          comments: row.comments || ''
        });
      }

      res.json({ message: 'Calificaciones actualizadas correctamente.' });
    } catch (error) {
      console.error('Error al subir Excel:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = ExcelEnrollmentsController;
