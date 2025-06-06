const express = require('express');
const router = express.Router();

const OperatinalUnitsController = require('../Controllers/operational/operationalUnitsController');

// localhost:8000/api/operation/units
router.get('/units', OperatinalUnitsController.getAll);

//XD
// Crear una unidad operativa
//router.post('/', OperationalUnitsController.create);

// Actualizar una unidad operativa
router.put('/:id', OperatinalUnitsController.update);

// Eliminar una unidad operativa
router.delete('/:id', OperatinalUnitsController.delete);

// Asignar un usuario a una unidad operativa
router.post('/assign-user', OperatinalUnitsController.assignUser);

// Remover un usuario de una unidad operativa
router.post('/remove-user', OperatinalUnitsController.removeUser);

// Obtener unidades por ID de usuario
router.get('/user/:user_id', OperatinalUnitsController.getByUser);

module.exports = router;

