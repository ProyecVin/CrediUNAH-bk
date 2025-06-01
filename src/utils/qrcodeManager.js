const QRCode = require('qrcode');

const generateQRCode = ( data ) => { 
    return new Promise((resolve, reject) => {
        QRCode.toDataURL(data, (err, url) => {
            if (err) {
                console.error('Error generating QR code:', err);
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
}

/**
 * Extract Base64 constent from URI string of an image.
 * @param {string} dataURI - String with format "data:image/png;base64,iVBORw0KGgo..."
 * @returns {string} -  Base64 (without prefix)
 */
const extractBase64 = (dataURI) => {

  if (!dataURI.startsWith('data:image/')) {
    throw new Error('Formato no válido. Se esperaba "data:image/[tipo];base64,..."');
  }

  const parts = dataURI.split(',');
  if (parts.length !== 2) {
    throw new Error('Formato incorrecto. No se encontró la coma separadora.');
  }

  return parts[1];
}

module.exports = {
    generateQRCode,
    extractBase64
}