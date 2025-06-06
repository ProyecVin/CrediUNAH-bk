const { PDFDocument, rgb, degrees } = require('pdf-lib');
var fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const axios = require('axios');
const { drawTextP, drawTextColumnCentered, drawImageFromBase64, drawImageP, drawRotatedText, drawImagesInLine } = require('../../utils/pdfGenerator'); 

const generateCertificate = async ({
    templatePath,
    studentName, 
    studentDNI,
    skills, 
    courseName, 
    operationalUnit, 
    durationInHours, 
    dateInLetters, 
    courseType, 
    logos,
    signers,
    qrBase64,
    uniqueCode,
    is_physically_signed
}) => {
        
    let templateBytes;

    if (templatePath.startsWith('http') || templateUrl) {
        // In case is URL
        const urlToUse = templatePath.startsWith('http') ? templatePath : templateUrl;
        const response = await axios.get(urlToUse, { responseType: 'arraybuffer' });
        templateBytes = response.data;

    } else {

        // In case in local File
        console.log(`↓ Cargando plantilla local: ${templatePath}`);
        templateBytes = await fsp.readFile(templatePath);
    }

    // Document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // src\assets\fonts\Roboto_Serif\static\RobotoSerif_28pt-Bold.ttf
    const principalTextFontPath = path.resolve(__dirname, '../../assets/fonts/Roboto_Serif/static/RobotoSerif_28pt-Bold.ttf');
    const principalTextFontBytes = await fsp.readFile(principalTextFontPath);
    const principalTextFont = await pdfDoc.embedFont(principalTextFontBytes);

    // src\assets\fonts\Lato\Lato-Regular.ttf
    const generalFontPath = path.resolve(__dirname, '../../assets/fonts/Lato/Lato-Regular.ttf');
    const generalFontBytes = await fsp.readFile(generalFontPath);
    const generalFont = await pdfDoc.embedFont(generalFontBytes);

    // src\assets\fonts\Lato\Lato-Bold.ttf
    const generalFontBoldPath = path.resolve(__dirname, '../../assets/fonts/Lato/Lato-Bold.ttf');
    const generalFontBoldBytes = await fsp.readFile(generalFontBoldPath);
    const generalFontBold = await pdfDoc.embedFont(generalFontBoldBytes);

    const generalFontSize = 15;
    const littleGeneralFontSize = 12;
    const mainFontSize = 32;
    const textColor = rgb(0, 0, 0);

    // Name ot the student
    drawTextP({
        page,
        text: studentName,
        y: 330,
        font: principalTextFont,
        size: mainFontSize,
        color: textColor,
        is_centered: true
    });

    // Adquired skills
    drawTextP({
        page,
        text: skills + ',',
        x: 400,
        y: 284,
        font: generalFont,
        size: generalFontSize,
        color: textColor,
        is_centered: false
    });

    // Course name
    drawTextP({
        page,
        text: courseName.toUpperCase(),
        y: 256,
        font: generalFontBold,
        size: generalFontSize,
        color: textColor,
        is_centered: true
    });

    // Operational unit
    drawTextP({
        page,
        text: operationalUnit,
        x: 414,
        y: 230,
        font: generalFontBold,
        size: generalFontSize,
        color: textColor,
        is_centered: false
    });

    // Duration in hours
    drawTextP({
        page,
        text: durationInHours + ' horas',
        x: 429,
        y: 203,
        font: generalFontBold,
        size: generalFontSize,
        color: textColor,
        is_centered: false
    });

    // Date
    drawTextP({
        page,
        text: 'el ' + dateInLetters + '.',
        x: 494,
        y: 167,
        font: generalFont,
        size: generalFontSize,
        color: textColor,
        is_centered: false
    });

    // Type 
    drawTextP({
        page,
        text: courseType.toLowerCase() + ':',
        x: 667,
        y: 284,
        font: generalFont,
        size: generalFontSize,
        color: textColor,
        is_centered: false
    });

    // Logo
    for (const logo of logos) {
        if(logo.logoOrder == 1){
            await drawImageP({
                pdfDoc,
                page,
                imagePath: logo.URL,
                x: 82,
                y: 480.96, 
                height: 71.28
            });
        }
    }

    // Signers
    // Signatures images
    const signatureImages = signers.filter(signer => signer.urlSignature).map(signer => ({
        path: signer.urlSignature,
        height: 55 // Fixed height for all
    }));

    if (signatureImages.length > 0) {
        await drawImagesInLine({
            pdfDoc,
            page,
            spacing: 95,
            images: signatureImages,
            y: 102 
        });
    }

    // Signers info
    const columnWidth = 260;
    const xStart = 25;
    const yStart = 80;
    const lineSpacing = 15;

    signers.forEach((signer, index) => {
        const x1 = xStart + index * columnWidth;
        const x2 = x1 + columnWidth;

        drawTextColumnCentered({
            page,
            texts: signer.text,
            font: generalFont,
            size: littleGeneralFontSize,
            color: textColor,
            x1,
            x2,
            yStart,
            lineSpacing
        });
    });

    // qr code
    drawImageFromBase64({
        pdfDoc,
        page,
        base64: qrBase64,
        x: 709,
        y: 390,
        width: 80,
        height: 80,
    });

    // Code
    drawRotatedText({
        page,
        text: uniqueCode,
        x: 809,
        y: 190,
        size: generalFontSize,
        font: generalFontBold,
        color: textColor,
        rotate: degrees(90),
    });
        
    // Save PDF
    const pdfBytes = await pdfDoc.save();

    console.log(`✅ CAFI de ${studentDNI} generado en /new`);

    return {
        pdfBytes,
        fileName: `${studentDNI}.pdf`
    }
}

  module.exports = {
    generateCertificate
  }