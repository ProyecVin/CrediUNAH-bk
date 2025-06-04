const EnrollmentModel = require('../../models/enrollments/EnrollmentModel');

const xlsx = require('xlsx');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

class EnrollmentController {
  constructor() {
    this.enrollmentModel = EnrollmentModel;
  }

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

  getAllCourseEnrollmentsForAdmin = async (req, res) => {
    try {
        const result = await this.enrollmentModel.getAllCourseEnrollmentsForAdmin(req.params.courseId);
        res.json ({ success: true, message: 'Estudiantes obtenidos con éxito.', result});
    } catch (error) {
        console.error('Error generating certificates:', error);
        return res.status(500).json({ success: false, message: 'Error obteniendo estudiantes del curso', error: error.message });
    }
  }

  //Leer el archivo de excel para calificar notas
async importGradesFromExcel(req, res) {
    try {
      const { courseId, studentId, grade, comments = 1 } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ningún archivo." });
      }

      const filePath = req.file.path;

      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);

      await sql.connect(dbConfig);

      for (const row of rows) {
        const full_name = row["Nombre Completo"];
        const studentId = row["Numero Identidad"];
        const grade = parseFloat(row["Calificacion"]);
        const comments = row["Obs"] || null;

        if (!studentId || isNaN(grade)) {
          console.warn(`Saltando fila inválida: ${JSON.stringify(row)}`);
          continue;
        }

        await sql.query`
          INSERT INTO linkage.Course_Enrollments (
            student_id, course_id, enrolled_at, evaluated_at,
            status_id, grade, comments, last_updated_at, project_id
          ) VALUES (
            ${studentId}, ${courseId}, GETDATE(), GETDATE(),
            ${statusId}, ${grade}, ${comments}, GETDATE(), ${projectId}
          )
        `;
      }

      await sql.close();
      fs.unlinkSync(filePath); // Limpia archivo temporal
      res.status(200).json({ message: "Importación completada correctamente." });

    } catch (err) {
      console.error("Error al importar Excel:", err);
      res.status(500).json({ message: "Error al importar Excel.", error: err.message });
    }
  }

}

module.exports = new EnrollmentController();


