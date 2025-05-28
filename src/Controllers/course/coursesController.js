// src/Controllers/operational/courses.js
const CoursesModel = require('../../models/courses/courseModel');

class CoursesController {
    async getCoursesForLanding(req, res) {
        try {
            const courses = await CoursesModel.getCoursesForLanding();
            
            if (courses.length === 0) {
                return res.status(404).json({ 
                    message: 'No se encontraron cursos activos para mostrar' 
                });
            }
            
            res.json(courses); 
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    async getCourseById(req, res) {
    try {
        const { id } = req.params;
        const course = await CoursesModel.getCourseById(id);
        
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

}

module.exports = new CoursesController();