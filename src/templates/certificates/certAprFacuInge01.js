const { PDFDocument, rgb, StandardFonts, drawText } = require('pdf-lib');
var fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const { drawTextP, drawImagesInLine, drawImageFromBase64, generatePDFGridLayout } = require('../../utils/pdfGenerator'); 

generatePDFGridLayout(
    path.resolve(__dirname, '../../assets/templates/certAprFacuInge01.pdf'),  
    path.resolve(__dirname, '../../assets/generated/certAprFacuInge01Grid.pdf')
);

const generarCertificado = async (studentName, skills, courseName, operationalUnit, durationInHours) => {
    // 1. Leer la plantilla
    const templatePath = path.resolve(__dirname, "../../assets/templates/certAprFacuInge01.pdf");
    const templateBytes = fs.readFileSync(templatePath);

    // Document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // // Fonts src\assets\fonts\PT_Serif\PTSerif-Bold.ttf
    const principalTextFontPath = path.resolve(__dirname, '../../assets/fonts/PT_Serif/PTSerif-Bold.ttf');
    const principalTextFontBytes = await fsp.readFile(principalTextFontPath);
    const principalTextFont = await pdfDoc.embedFont(principalTextFontBytes);

    const generalFontPath = path.resolve(__dirname, '../../assets/fonts/montnapha-font/MontnaphaDemoLight-2OZgW.otf');
    const generalFontBytes = await fsp.readFile(generalFontPath);
    const generalFont = await pdfDoc.embedFont(generalFontBytes);

    // ssrc\assets\fonts\Ancizar_Serif\static\AncizarSerif-Bold.ttf
    const generalFontBoldPath = path.resolve(__dirname, '../../assets/fonts/Ancizar_Serif/static/AncizarSerif-ExtraBold.ttf');
    const generalFontBoldBytes = await fsp.readFile(generalFontBoldPath);
    const generalFontBold = await pdfDoc.embedFont(generalFontBoldBytes);

    // Name ot the student
    drawTextP({
        page,
        text: studentName,
        x: 200,
        y: 345,
        font: principalTextFont,
        size: 32,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
    });

    // Adquired skills
    drawTextP({
        page,
        text: skills + ',',
        x: 390,
        y: 306,
        font: generalFont,
        size: 14,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: false
    });

    // Course name
    drawTextP({
        page,
        text: courseName.toUpperCase(),
        y: 283,
        font: generalFontBold,
        size: 15,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
    });

    // Operational unit
    drawTextP({
        page,
        text: operationalUnit,
        x: 425,
        y: 261,
        font: generalFontBold,
        size: 15,
        color: rgb(0,0,0),
        is_centered: false
    });

    // Duration in hours
    drawTextP({
        page,
        text: durationInHours + ' horas',
        x: 405,
        y: 239,
        font: generalFontBold,
        size: 14,
        color: rgb(0,0,0),
        is_centered: false
    });

    // drawTextP({
    //     page,
    //     text: nombreCurso,
    //     x: 200,
    //     y: 200,
    //     font: font,
    //     size: 24,
    //     color: rgb(0,0,0),
    //     is_centered: true
    // });

    // await drawImagesInLine({
    //     pdfDoc,
    //     page,
    //     spacing: 70,
    //     logos: [
    //         { path: '../assets/logos/logo1.png', height: 55 },
    //         { path: '../assets/logos/logo2.png', height: 40 },
    //         { path: '../assets/logos/logo3.png', height: 50 },
    //     ],
    //     y: 420
    // });


    // // Firmar
    // await drawImagesInLine({
    //     pdfDoc,
    //     page,
    //     spacing: 70,
    //     logos: [
    //         { path: '../assets/signatures/firma1.jpg', height: 55 },
    //     ],
    //     y: 120
    // });

    // page.drawLine({
    //     start: { x: 250, y: 125 },
    //     end: { x: 500, y: 125 },
    //     thickness: 2, 
    //     color: rgb(0, 0, 0), 
    // });

    // drawImageFromBase64({
    //     pdfDoc,
    //     page,
    //     base64:"iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAAAklEQVR4AewaftIAAAYESURBVO3BQW4kO5QgQXci739lb+2avSEQiJQ+a+aZ2Q/GuMRijIssxrjIYoyLLMa4yGKMiyzGuMhijIssxrjIYoyLLMa4yGKMiyzGuMhijIssxrjIYoyLfHhJ5S9V7FR2FScqT1TsVHYVJyq7ijdUdhUnKn+p4o3FGBdZjHGRxRgX+fBlFd+kclKxU9lVvKGyq3hDZVfxRMUbFd+k8k2LMS6yGOMiizEu8uGXqTxR8U0qu4qdyq5ip7JT+U0qu4qdyq7iDZUnKn7TYoyLLMa4yGKMi3z4x6mcVOxUnqg4UTmpeENlV/H/ssUYF1mMcZHFGBf58P+Ziv+Syq5i/K/FGBdZjHGRxRgX+fDLKv5LKk9UnKjsKnYqJxU7lSdUTiqeqLjJYoyLLMa4yGKMi3z4MpX/UsVOZVexUzlR2VXsVHYVO5VdxUnFTmVXsVN5QuVmizEushjjIosxLvLhpYqbVexUvqlip3KicqKyq3ij4l+yGOMiizEushjjIh9eUtlVPKGyq9ipvKHyRsVOZVdxUnGicqJyUrFT+aaKE5VdxRuLMS6yGOMiizEu8uHLVHYVJxU7lV3FTmVX8UbFGyonKruKXcVO5ZsqnlDZqewqftNijIssxrjIYoyLfPiyip3KruKkYqdyovJExYnKExUnKk9UnKj8pYqdyq7imxZjXGQxxkUWY1zkw0sVO5U3VHYVO5VdxU7lCZWTihOVXcWuYqdyUrFT2VXsVHYVb1T8lxZjXGQxxkUWY1zkw0sqb6icqOwqdiq7ip3KScVO5TdVvKHyhMobFbuK37QY4yKLMS6yGOMi9oMXVE4qTlROKnYqJxXfpLKrOFF5o+IJlV3FicquYqdyUvGbFmNcZDHGRRZjXMR+8ItUdhU7lW+q2Kk8UbFTOanYqZxU7FROKnYqv6lip3JS8U2LMS6yGOMiizEu8uEllZOKJyp+U8VOZafyhMobFTuV31SxU9mp7Cr+0mKMiyzGuMhijIt8+GUqT6h8U8VO5aTiDZUTlSdUnqjYqXyTyq7imxZjXGQxxkUWY1zEfvBFKruKE5WTip3KGxVvqJxU7FR2FTuVXcVO5YmKN1SeqPimxRgXWYxxkcUYF/nwksquYqfyRMVO5aTiDZVvUtlVPKHyhsquYqeyqzip+EuLMS6yGOMiizEu8uGlip3KScVO5aRip3KiclJxUrFTOanYqexUdhVPVJyonKg8UXGisqv4psUYF1mMcZHFGBexH3yRyknFEypPVJyo7Cp2KicVT6g8UfGEyhMVO5WTir+0GOMiizEushjjIvaDF1TeqHhDZVexUzmpeEPlpGKnsqs4UdlVvKGyqzhROan4psUYF1mMcZHFGBf58FLFicquYqfymyp2KjuVXcVOZVdxUrFTeUJlV7FT2VXsVHYVJyonFTuV37QY4yKLMS6yGOMi9oM/pPJExRsqu4qdyknFEyq/qWKn8kTFTmVXcaJyUvHGYoyLLMa4yGKMi9gPXlB5omKnsqvYqZxUnKicVOxUvqniROVfVvFNizEushjjIosxLmI/+Iep7Cp2KicVJypvVDyh8kbFEyq7ip3KruI3Lca4yGKMiyzGuMiHl1T+UsWJyknFN1WcqOwqTiqeUDlR2VWcqOwq/tJijIssxrjIYoyLfPiyim9SOal4QmVXsVN5QmVXsavYqewqTlR2FU9UPFHxhMqu4o3FGBdZjHGRxRgX+fDLVJ6oeELlN1WcqNxE5Q2VXcVfWoxxkcUYF1mMcZEP/7iKncquYqfyhMquYldxonKisqvYVexUdhUnKk9U7FROKr5pMcZFFmNcZDHGRT6M/6Nip7JT2VU8UbFT2ansKnYVJypvqJxU/KbFGBdZjHGRxRgX+fDLKv5SxUnFTuWkYqeyU3mjYqdyonJS8S9bjHGRxRgXWYxxEfvBCyp/qWKnsqvYqewqfpPKrmKn8l+qOFHZVZyo7CreWIxxkcUYF1mMcRH7wRiXWIxxkcUYF1mMcZHFGBdZjHGRxRgXWYxxkcUYF1mMcZHFGBdZjHGRxRgXWYxxkcUYF1mMcZH/AdTJ2WaUVTglAAAAAElFTkSuQmCC",
    //     x: 250,
    //     y: 130,
    //     width: 70,
    //     height: 70,
    // });
        
    // 5. Guardar nuevo PDF
    const pdfBytes = await pdfDoc.save();

    const savePath = path.resolve(__dirname, '../../assets/generated/certAprFacuInge01Generated.pdf');
    fs.writeFileSync(savePath, pdfBytes);

    console.log('✅ Certificado generado en /generated');
}

// Skills should be less than 25 characters
generarCertificado('Denisse Hernandez', ' producir alimentos inocuos', 'Curso de Backend con Node.js', 'Departamento de Ingeniería Química', 40)
  .then(() => console.log('✅ Certificado generado exitosamente.'))
  .catch((err) => console.error('❌ Error generando certificado:', err));