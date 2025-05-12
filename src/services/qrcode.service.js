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

module.exports = {
    generateQRCode
}