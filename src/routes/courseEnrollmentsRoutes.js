// src/routes/enrollmentsRoutes.js
const express = require('express');
const router = express.Router();

//const EnrollmentController = require('../Controllers/enrollments/enrollmentController');
//const upload = require('../../middleware/uploadExcel');
const CourseEnrollmentController = require('../Controllers/enrollments/courseEnrollmentController');
//const upload = require('../middleware/uploadExcel');

/*router.post('/grade', EnrollmentController.gradeStudent);
router.get('/course/:courseId', EnrollmentController.getAllCourseEnrollmentsForAdmin);
router.post('/import-excel', upload.single('excel'), EnrollmentController.importGradesFromExcel);
*/

// /enrollments

router.get('/:id', CourseEnrollmentController.getById);
router.get('/courses/:courseId/enrollments', CourseEnrollmentController.getByCourse);
router.get('/students/:userId/enrollments', CourseEnrollmentController.getByStudent);
router.post('/', CourseEnrollmentController.create);
router.put('/:id', CourseEnrollmentController.update);
router.delete('/:id', CourseEnrollmentController.delete);
router.get('/all', CourseEnrollmentController.getAll);
module.exports = router;

