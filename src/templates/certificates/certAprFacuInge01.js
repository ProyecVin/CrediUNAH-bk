const { PDFDocument, rgb, degrees } = require('pdf-lib');
var fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const axios = require('axios');
const { drawTextP, drawTextColumnCentered, drawImageFromBase64, drawParagraph, drawRotatedText, drawImagesAligned, toBoldFormat } = require('../../utils/pdfGenerator'); 
const { formatDateToDayMonthInLetters } = require('../../utils/dateManager');

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
    is_physically_signed,
    startDate,
    endDate
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

    // Skills
    drawParagraph({ 
        page, 
        font: generalFont, 
        boldFont: generalFontBold,
        text: `Posee conocimientos y competencias básicas para ${skills}, al aprobar el ${courseType.toLowerCase()}:`, 
        x1: 60,
        x2: 775, 
        y: 284, 
        fontSize: generalFontSize, 
        lineHeight: 1.3, 
        center: true 
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

    // Aditional text
    drawParagraph({ 
        page, 
        font: generalFont, 
        boldFont: generalFontBold,
        text: `Impartido por la **Facultad** **de** **Ingeniería**, a través del ${toBoldFormat(operationalUnit)} y 
                la **Coordinación** **de** **Vinculación**, del ${toBoldFormat(formatDateToDayMonthInLetters(startDate))} 
                **al** ${toBoldFormat(formatDateToDayMonthInLetters(endDate))} con una duración total de **${durationInHours}** **horas.**`, 
        x1: 60,
        x2: 775, 
        y: 230, 
        fontSize: generalFontSize, 
        lineHeight: 2, 
        center: false 
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

    // Logos
    const logosToDraw = logos
    .filter(logo => logo.URL)
    .sort((a, b) => a.logoOrder - b.logoOrder) // Ordenar por logoOrder
    .map(logo => ({
        path: logo.URL,
        height: 71.28 // Altura fija
    }));
    
    console.log(logosToDraw);

    await drawImagesAligned({
        pdfDoc,
        page,
        spacing: 225,   
        y: 490.96,
        images: logosToDraw,
        align: 'center'
    });

    // Signers
    // Signatures images
    if( is_physically_signed) {
        const signatureImages = signers.filter(signer => signer.urlSignature).map(signer => ({
            path: signer.urlSignature,
            height: 55 // Fixed height for all
        }));

        if (signatureImages.length > 0) {
            await drawImagesAligned({
                pdfDoc,
                page,
                spacing: 150,
                images: signatureImages,
                y: 104,
                align: 'center'
            });
        }
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

    console.log(`✅ CAFI de ${studentDNI} generado.`);

    return {
        pdfBytes,
        fileName: `${studentDNI}.pdf`
    }
}

  module.exports = {
    generateCertificate
  }