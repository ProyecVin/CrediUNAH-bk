const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/authRoutes');
const certificatesRoutes = require('./routes/certificatesRoutes');
const operationalUnitsRoutes = require('./routes/operationalUnitsRoutes');
const courseInstructorsRoutes = require('./routes/courseInstructorsRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const modalitiesRoutes = require('./routes/modalitiesRoutes');
const postCourseRoutes = require('./routes/postCourseRoutes');
const enrollmentsRoutes = require('./routes/enrollmentsRoutes');
const courseEnrollmentsRoutes = require('./routes/courseEnrollmentsRoutes');

router.use('/auth', authRoutes);
router.use('/courses', coursesRoutes); //Rafa
router.use('/certificates', certificatesRoutes);
router.use('/operation', operationalUnitsRoutes);//Rafa
router.use('/instructors', courseInstructorsRoutes);
router.use('/courses', coursesRoutes);
router.use('/modalities', modalitiesRoutes); 
router.use('/post', postCourseRoutes); 
router.use('/enrollments', enrollmentsRoutes); //Kat
router.use('/excel', enrollmentsRoutes);//Rafa
router.use('/enrollments', courseEnrollmentsRoutes);

module.exports = router;

