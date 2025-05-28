// src/controllers/operational/CoursesController.js
const CoursesAdminModel = require('../../models/courses/CoursesAdminModel');

class CoursesAdminController {
    async getCoursesForAdmin(req, res) {
        try {
            const courses = await CoursesAdminModel.getCoursesForAdmin();
            res.json(courses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CoursesAdminController();