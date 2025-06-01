const { PDFDocument, rgb, StandardFonts, drawText } = require('pdf-lib');
var fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const { drawTextP, drawImageP, drawImagesInLine, generatePDFGridLayout, drawTextColumnCentered } = require('../../utils/pdfGenerator'); 

generatePDFGridLayout(
    path.resolve(__dirname, '../../assets/templates/constPartFacuInge01.pdf'),  
    path.resolve(__dirname, '../../assets/generated/constPartFacuInge01Grid.pdf')
);

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
    uniqueCode
}) => {
    // Read template
    templatePath = path.resolve(__dirname, "../../assets/templates/constPartFacuInge01.pdf");
    const templateBytes = fs.readFileSync(templatePath);

    // Document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // src\assets\fonts\Roboto_Serif\static\RobotoSerif_28pt-Bold.ttf
    const principalTextFontPath = path.resolve(__dirname, '../../assets/fonts/Roboto_Serif/static/RobotoSerif_28pt-Bold.ttf');
    const principalTextFontBytes = await fsp.readFile(principalTextFontPath);
    const principalTextFont = await pdfDoc.embedFont(principalTextFontBytes);

    // Font Path src\assets\fonts\tex-gyre-termes\texgyretermes-regular.otf
    const generalFontPath = path.resolve(__dirname, '../../assets/fonts/tex-gyre-termes/texgyretermes-regular.otf');
    const generalFontBytes = await fsp.readFile(generalFontPath);
    const generalFont = await pdfDoc.embedFont(generalFontBytes);

    // Font Path src\assets\fonts\tex-gyre-termes\texgyretermes-bold.otf
    const generalFontBoldPath = path.resolve(__dirname, '../../assets/fonts/tex-gyre-termes/texgyretermes-bold.otf');
    const generalFontBoldBytes = await fsp.readFile(generalFontBoldPath);
    const generalFontBold = await pdfDoc.embedFont(generalFontBoldBytes);

    const littleGeneralFontSize = 13;

    // Name ot the student
    drawTextP({
        page,
        text: studentName,
        x: 200,
        y: 345,
        font: principalTextFont,
        size: 36,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
    });

    // Type 
    drawTextP({
        page,
        text: courseType.toLowerCase(),
        x: 473,
        y: 302.5,
        font: generalFont,
        size: 19,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: false
    });

    // Course name
    drawTextP({
        page,
        text: courseName.toUpperCase(),
        y: 270,
        font: generalFontBold,
        size: 19,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
    });

    // Operational unit 
    drawTextP({
        page,
        text: operationalUnit,
        x: 473,
        y: 244,
        font: generalFontBold,
        size: 19,
        color: rgb(0,0,0),
        is_centered: false
    });

    // Duration in hours
    drawTextP({
        page,
        text: durationInHours + ' horas.',
        x: 540,
        y: 215,
        font: generalFontBold,
        size: 19,
        color: rgb(0,0,0),
        is_centered: false
    });

    // Issue Date
    drawTextP({
        page,
        text: 'el ' + dateInLetters + '.',
        x: 510,
        y: 170,
        font: generalFont,
        size: 20,
        color: rgb(0,0,0),
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
                y: 503, 
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
            spacing: 200,
            images: signatureImages,
            y: 90
        });
    }

    // Signers info
    const columnWidth = 227.91;
    let xStart = 125;
    const yStart = 65;
    const lineSpacing = 15;
    const space = 140; // space between lines

    signers.forEach((signer, index) => {
        const x1 = xStart + index * columnWidth;
        const x2 = x1 + columnWidth;

        drawTextColumnCentered({
            page,
            texts: signer.text,
            font: generalFont,
            size: littleGeneralFontSize,
            color: rgb(0,0,0),
            x1,
            x2,
            yStart,
            lineSpacing
        });

        xStart = xStart + space;

    });

    console.log(`✅ CPFI de ${studentDNI} generado en /generated`);
        
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