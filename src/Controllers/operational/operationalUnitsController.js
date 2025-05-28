//src/Controllers/operationalUnits.js
const OperationalUnitsModel = require ('../../models/operational/OperationalUnitsModel');

class OperationalUnitsController {

    async getAllOperationalUnits(req, res) {
        try {
          const operationalUnits = await OperationalUnitsModel.getAllOperationalUnits();
          if (operationalUnits.length === 0) {
            return res.status(404).json({ message: 'No hay unidades operacionales en la base de datos' });
          }
          res.json(operationalUnits); // Devolver la lista de unidades operacionales(facultades)
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
}

module.exports = new OperationalUnitsController();