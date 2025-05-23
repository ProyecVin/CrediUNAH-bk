const { PDFDocument, rgb, StandardFonts, drawText } = require('pdf-lib');
var fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const { drawTextP, drawImagesInLine, drawImageFromBase64, generatePDFGridLayout, drawTextCenteredInLine } = require('../../utils/pdfGenerator'); 

generatePDFGridLayout(
    path.resolve(__dirname, '../../assets/templates/constPartFacuInge01.pdf'),  
    path.resolve(__dirname, '../../assets/generated/constPartFacuInge01Grid.pdf')
);

const generarCertificado = async (studentName, courseName, signers, durationInHours, courseType, operationalUnit) => {
    // Read template
    const templatePath = path.resolve(__dirname, "../../assets/templates/constPartFacuInge01.pdf");
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

    // Name ot the student
    drawTextP({
        page,
        text: studentName,
        x: 200,
        y: 350,
        font: principalTextFont,
        size: 36,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
    });

    // Type 
    drawTextP({
        page,
        text: courseType.toLowerCase(),
        x: 480,
        y: 296,
        font: generalFont,
        size: 21,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: false
    });

    // Course name
    drawTextP({
        page,
        text: courseName.toUpperCase(),
        y: 268,
        font: generalFontBold,
        size: 19,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
    });

    // Operational unit - first part - 26 words

    // if(operationalUnit.length() > 40){
    //     throw new Error("El nombre de la unidad operativo excede el espacio de la plantilla.");
    // }

    // for (let i = 0; i < operationalUnit.length; i++) {
    //     if(i <= 26){
    //         operationalUnitFirstPart = operationalUnit[i];
    //     } else {
    //         operationalUnitSecondPart = operationalUnit[i];
    //     }

    // }

    drawTextP({
        page,
        text: 'Departamento de Ingeniería',
        x: 518,
        y: 238,
        font: generalFontBold,
        size: 21,
        color: rgb(0,0,0),
        is_centered: false
    });

    // Operational unit - second part - 16 words
    drawTextP({
        page,
        text: 'Química',
        x: 60,
        y: 209,
        font: generalFontBold,
        size: 21,
        color: rgb(0,0,0),
        is_centered: false
    });

    // Duration in hours
    drawTextP({
        page,
        text: durationInHours + ' horas.',
        x: 710,
        y: 209,
        font: generalFontBold,
        size: 21,
        color: rgb(0,0,0),
        is_centered: false
    });

    // Issue Date
    drawTextP({
        page,
        text: 'el 30 de mayo del año 2025.',
        x: 515,
        y: 170,
        font: generalFont,
        size: 20,
        color: rgb(0,0,0),
        is_centered: false
    });

    // drawTextCenteredInLine({
    //     page,
    //     texts: signers,
    //     y,
    //     font: generalFont,
    //     size: 13,
    //     color: rgb(0,0,0),
    // })

    x = 150;
    signers.map((signer) => {

        y = 75;
        // signer info
        drawTextP({
            page,
            text: signer.name,
            x,
            y,
            font: generalFont,
            size: 13,
            color: rgb(0,0,0),
            is_centered: false
        });

        signer.titles.map((title) => {
            y = y - 13;

            drawTextP({
                page,
                text: title,
                x,
                y: y,
                font: generalFont,
                size: 13,
                color: rgb(0,0,0),
                is_centered: false
            });
        })

        x = 500;
    })
        
    // Save PDF
    const pdfBytes = await pdfDoc.save();

    const savePath = path.resolve(__dirname, '../../assets/generated/constPartFacuInge01Generated.pdf');
    fs.writeFileSync(savePath, pdfBytes);

    console.log('✅ Certificado generado en /generated');
}

// Skills should be less than 25 characters
const signers = [
    {
        "name": "MSc. Guadalupe Nuñez Salgado",
        "titles": [
            "Coordinadora Académica",
            "Coordinadora de Vinculación ",
            "Facultad de Ingeniería"
        ]
    },
    {
        "name": "MSc. Jorge Maynor Vargas",
        "titles": [
            "Coordinador del curso de Inocuidad de alimentos",
            "Docente del Departamento de Ingeniería Química",
            "Facultad de Ingeniería"
        ]
    }
]

generarCertificado('Denisse Hernandez', 'inocuidad de los alimentos', signers,  40, 'curso')
  .then(() => console.log('✅ Certificado generado exitosamente.'))
  .catch((err) => console.error('❌ Error generando certificado:', err));