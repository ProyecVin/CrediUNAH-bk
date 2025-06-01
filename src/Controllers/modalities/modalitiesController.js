const ModalityModel = require('../../models/modalities/ModalitiesModel');

class ModalityController {
  async getAllModalities(req, res) {
    try {
      const modalities = await ModalityModel.getAllModalities();
      if (modalities.length === 0) {
        return res.status(404).json({ message: 'No hay modalidades registradas en la base de datos' });
      }
      res.json(modalities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ModalityController();
