// src/controllers/operational/CoursesController.js
const CoursesAdminModel = require('../../models/courses/CoursesAdminModel');
const CoursesModel = require('../../models/courses/CourseModel');

class CoursesAdminController {
    async getCoursesForAdmin(req, res) {
        try {
            const courses = await CoursesAdminModel.getCoursesForAdmin();
            res.json(courses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateCourse(req, res) {
        try {
            const courseData = req.body;
            const result = await CoursesModel.updateCourse(courseData);
            res.json({ message: 'Curso actualizado exitosamente', result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = new CoursesAdminController();


  