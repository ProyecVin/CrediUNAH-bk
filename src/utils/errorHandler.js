// src/utils/errorHandler.js

// Manejador de errores para rutas no encontradas
function notFoundHandler(req, res, next) {
    res.status(404).json({
      success: false,
      message: `No se encontró la ruta: ${req.originalUrl}`
    });
  }
  
  // Manejador de errores global
  function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    
    const statusCode = err.statusCode || 500;
    
    // Estructurar la respuesta de error
    const errorResponse = {
      success: false,
      message: err.message || 'Error interno del servidor'
    };
    
    // Añadir stack trace en desarrollo
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }
    
    res.status(statusCode).json(errorResponse);
  }
  
  module.exports = {
    notFoundHandler,
    errorHandler
  };