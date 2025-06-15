const { PDFDocument, rgb, StandardFonts, drawText } = require('pdf-lib');
var fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const { drawTextP, drawImageP, drawImagesAligned, drawTextColumnCentered, drawParagraph, toBoldFormat } = require('../../utils/pdfGenerator'); 
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
        y: 340,
        font: principalTextFont,
        size: 36,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
    });

    // Type 
    drawTextP({
        page,
        text: `Por haber participado en el ${courseType.toLowerCase()}:`,
        y: 302.5,
        font: generalFont,
        size: 19,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
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

    // Paragraph
    drawParagraph({ 
        page, 
        font: generalFont, 
        boldFont: generalFontBold,
        text: `Impartido por la **Facultad** **de** **Ingeniería**, a través del ${toBoldFormat(operationalUnit)} y 
                la **Coordinación** **de** **Vinculación**, del ${toBoldFormat(formatDateToDayMonthInLetters(startDate))} 
                **al** ${toBoldFormat(formatDateToDayMonthInLetters(endDate))} con una duración total de **${durationInHours}** **horas.**`, 
        x1: 60,
        x2: 775, 
        y: 242, 
        fontSize: 19, 
        lineHeight: 1.3, 
        center: false 
    });

    // Issue Date
    drawTextP({
        page,
        text: `Dado en Ciudad Universitaria, Tegucigalpa, MDC, el ${dateInLetters}.`,
        // x: 510,
        y: 158,
        font: generalFont,
        size: 19,
        color: rgb(0,0,0),
        is_centered: true
    });

    // Logos
    const logosToDraw = logos
    .filter(logo => logo.URL)
    .sort((a, b) => a.logoOrder - b.logoOrder) // by logoOrder
    .map(logo => ({
        path: logo.URL,
        height: 60 
    }));

    await drawImagesAligned({
        pdfDoc,
        page,
        spacing: 10,   
        y: 508,
        images: logosToDraw,
        align: 'left',
        marginStart: 90,
        grayscale: true
    });

    // for (const logo of logos) {
    //     if(logo.logoOrder == 1){
    //         await drawImageP({
    //             pdfDoc,
    //             page,
    //             imagePath: logo.URL,
    //             x: 273,
    //             y: 508, 
    //             height: 60,
    //             grayscale: true
    //         });
    //     }
    // }

    // Signers
    // Signatures images
    const signatureImages = signers.filter(signer => signer.urlSignature).map(signer => ({
        path: signer.urlSignature,
        height: 55 // Fixed height for all
    }));

    if (signatureImages.length > 0 && is_physically_signed) {
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
    let xStart = 158;
    const yStart = 65;
    const lineSpacing = 15;
    const space = 90; // space between lines

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

    console.log(`✅ CPFI de ${studentDNI} generado.`);
        
    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return {
        pdfBytes,
        fileName: `${studentDNI}.pdf`
    }
}

module.exports = {
    generateCertificate
}