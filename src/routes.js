const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/authRoutes');
const certificatesRoutes = require('./routes/certificatesRoutes');
const operationalUnitsRoutes = require('./routes/operationalUnitsRoutes');
const instructorsRoutes = require('./routes/instructorsRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const modalitiesRoutes = require('./routes/modalitiesRoutes');
const postCourseRoutes = require('./routes/postCourseRoutes');
const courseAdminRoutes = require('./routes/coursesAdminRoutes');
const enrollmentsRoutes = require('./routes/enrollmentsRoutes');

router.use('/auth', authRoutes);
router.use('/courses', coursesRoutes); 
router.use('/certificates', certificatesRoutes);
router.use('/operation', operationalUnitsRoutes);
router.use('/instructors', instructorsRoutes);
router.use('/courses', coursesRoutes);
router.use('/modalities', modalitiesRoutes); 
router.use('/post', postCourseRoutes); 
router.use('/courses', courseAdminRoutes); // Este puede ir dentro de las rutas de courses -----
router.use('/enrollments', enrollmentsRoutes);

module.exports = router;

