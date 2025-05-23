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
    logoPath,
    signers,
    qrBase64,
    uniqueCode
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
        x: 398,
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
        x: 670,
        y: 284,
        font: generalFont,
        size: generalFontSize,
        color: textColor,
        is_centered: false
    });
    
    // Logo
    await drawImageP({
        pdfDoc,
        page,
        imagePath: logoPath,
        x: 82,
        y: 480.96, 
        height: 71.28
    })

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

    const savePath = path.resolve(__dirname, `../../assets/new/${studentDNI}_certAprFacuInge01Generated.pdf`);
    fs.writeFileSync(savePath, pdfBytes);

    console.log(`✅ Certificado de ${studentDNI} generado  en /new`);
}

//     // Signers
// const signers = [
//     {
//         "urlSignature": 'https://linkage-storage.s3.us-east-1.amazonaws.com/images/firma1.jpg', // path.resolve(__dirname, '../../assets/images/signatures/firma1.jpg'),
//         "text": ['MSc. Guadalupe Nuñez Salgado', 'Coordinadora Académica', 'Coordinadora de Vinculación', 'Facultad de Ingeniería'],
//     },
//     {
//         "urlSignature": path.resolve(__dirname, '../../assets/images/signatures/firma1.jpg'),
//         "text": ['Dr. Miguel Ezequiel Padilla', 'Jefe del departamento de Ingeniería Química', 'Facultad de Ingeniería'],
//     },
//     {
//         "urlSignature": path.resolve(__dirname, '../../assets/images/signatures/firma1.jpg'),
//         "text": ['MSc. Jorge Maynor Vargas', 'Coordinador del curso de Inocuidad de alimentos', 'Docente del Departamento de Ingeniería Química', 'Facultad de Ingeniería']
//     }
// ];

// // Skills should be less than 25 characters
// // URL https://linkage-storage.s3.us-east-1.amazonaws.com/templates/certAprFacuInge01.pdf
// const templatePath = 'https://linkage-storage.s3.us-east-1.amazonaws.com/templates/certAprFacuInge01.pdf'; // path.resolve(__dirname, "../../assets/templates/certAprFacuInge01.pdf");
// // path.resolve(__dirname, '../../assets/images/logos/logoIngQuimicaUNAH.png')
// // generateCertificate({
// //     templatePath,
// //     studentName: 'Denisse Hernandez', 
// //     skills: ' producir alimentos inocuos', 
// //     courseName: 'inocuidad de alimentos', 
// //     operationalUnit: 'Departamento de Ingeniería Química', 
// //     durationInHours: 40, 
// //     dateInLetters: '15 de diciembre del año 2023',
// //     courseType: 'curso',
// //     logoPath: 'https://dircom.unah.edu.hn/dmsdocument/13698-ingenieria-quimica-industrial-color-png',
// //     signers,
// //     qrBase64: "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",
// //     uniqueCode: 'CV-052025001'
// // })
// //   .then(() => console.log('✅ Certificado generado exitosamente.'))
// //   .catch((err) => console.error('❌ Error generando certificado:', err));

  module.exports = {
    generateCertificate
  }