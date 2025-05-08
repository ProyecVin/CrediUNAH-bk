const s3Manager = require('../services/s3.service.js');

class TestController {
  constructor() {
    this.prueba = 'Hola Mundo';
  }

  getPrueba(req, res) {
    res.json({ message: this.prueba });
  }

  async uploadFileToS3(req, res) {
      try {
        const result = await s3Manager.uploadFileToS3(req.files.file); // Loading the first file from the array
        return res.status(200).json({ message: 'Archivo cargado correctamente', result });
      } catch (error) {
        console.error('Error al cargar el archivo:', error);
        res.status(500).json({ message: 'Error al cargar el archivo', error: error.message });
      }
  }

  async getFilesFromS3(req, res) {
    try {
      const result = await s3Manager.getFilesFromS3();
      return res.status(200).json({ message: 'Se obtuvieron los archivos correctamente', result: result.Contents });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener archivos', error: error.message });
    }
  }

  async getFileFromS3(req, res) {
    try {
      const result = await s3Manager.getFileFromS3(req.params.fileName);
      if (!result) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }
      console.log(result);
      return res.status(200).json({ message: 'Se obtuvo el archivo correctamente', result: result.$metadata});
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener archivo', error: error.message });
    }
  }

  async getPresignedURL(req, res) {
    try {
      const result = await s3Manager.generatePresignedUrl(req.params.fileName);
      if (!result) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }
      console.log(result);
      return res.status(200).json({ message: 'URL prefirmada generada exitosamente', result});
    } catch (error) {
      res.status(500).json({ message: 'Error al generar URL prefirmada', error: error.message });
    }
  }
  
}

module.exports = new TestController();