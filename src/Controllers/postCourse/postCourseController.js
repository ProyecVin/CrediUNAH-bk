const CourseModel = require('../../models/postCourse/PostCourseModel');

class CourseController {
    async registerCourse(req, res) {
        try {
            const courseData = req.body;

            const requiredFields = [
                'title', 'description', 'start_date', 'end_date', 'duration_in_hours',
                'has_microcredential', 'max_enrollment', 'image_id', 'created_by',
                'operational_unit_id', 'modality_id'
            ];

            const missingFields = requiredFields.filter(field => !(field in courseData));
            if (missingFields.length > 0) {
                return res.status(400).json({ message: `Missing fields: ${missingFields.join(', ')}` });
            }

            const success = await CourseModel.createCourse(courseData);
            if (success) {
                res.status(201).json({ message: 'Course successfully registered.' });
            } else {
                res.status(500).json({ message: 'Failed to register course.' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CourseController();
