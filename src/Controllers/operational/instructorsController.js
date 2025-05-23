// src/Controllers/operational/instructorsController.js
const InstructorsModel = require('../../models/operational/InstructorsModel');

class InstructorsController {
    async getInstructorsByUnit(req, res) {
        try {
            const { unitId } = req.params;
            const instructors = await InstructorsModel.getInstructorsByUnit(unitId);
            
            if (instructors.length === 0) {
                return res.status(404).json({ message: 'No se encontraron instructores para esta unidad operativa' });
            }

            res.json(instructors);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new InstructorsController();