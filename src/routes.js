const express = require('express');
const router = express.Router();

const authRoutes = require('./routes/authRoutes');
const operationalUnitsRoutes = require('./routes/operationalUnitsRoutes')
const coursesRoutes = require('./routes/coursesRoutes');
const modalitiesRoutes = require('./routes/modalitiesRoutes');
const postCourseRoutes = require('./routes/postCourseRoutes');
const courseAdminRoutes = require('./routes/coursesAdminRoutes');

router.use('/auth', authRoutes);
router.use('/operation', operationalUnitsRoutes);
router.use('/courses', coursesRoutes);
router.use('/modalities', modalitiesRoutes); 
router.use('/post', postCourseRoutes); 
router.use('/courses', courseAdminRoutes); 

module.exports = router;