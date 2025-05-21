const fs = require('fs');
const { PDFDocument, rgb, StandardFonts, drawText } = require('pdf-lib');
const fsp = require('fs/promises');
const path = require('path');

/**
 * Inserta varios logos centrados horizontalmente en una página PDF, cada uno con su altura especificada.
 * @param {Object} options
 * @param {PDFDocument} options.pdfDoc - Documento PDF
 * @param {PDFPage} options.page - Página donde se dibujarán los logos
 * @param {{ path: string, height: number }[]} options.logos - Lista de rutas locales con altura por imagen
 * @param {number} [options.y=700] - Posición vertical donde colocarlos
 */
async function drawImagesInLine({ pdfDoc, page, logos, y = 700, spacing = 30 }) {
  const logoBuffers = await Promise.all(
    logos.map(logo => fsp.readFile(path.resolve(logo.path)))
  );

  const embeddedImages = await Promise.all(
    logoBuffers.map((buffer, index) => {
      const ext = path.extname(logos[index].path).toLowerCase();
      return ext === '.jpg' || ext === '.jpeg'
        ? pdfDoc.embedJpg(buffer)
        : pdfDoc.embedPng(buffer);
    })
  );

  const scaledImages = embeddedImages.map((img, index) => {
    const height = logos[index].height;
    const scale = height / img.height;
    return {
      image: img,
      width: img.width * scale,
      height,
    };
  });

  const totalWidth = scaledImages.reduce((acc, img) => acc + img.width, 0) + spacing * (scaledImages.length - 1);
  const pageWidth = page.getWidth();

  let x = (pageWidth - totalWidth) / 2;

  for (const img of scaledImages) {
    page.drawImage(img.image, {
      x,
      y,
      width: img.width,
      height: img.height,
    });
    x += img.width + spacing;
  }
}

async function drawTextP({ page, text, x, y, font, size, color, is_centered = false }) {

    if (is_centered) {
        const { width } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, size);
        x = (width - textWidth) / 2;
    }

    page.drawText(text, {
        x,
        y,
        size,
        font,
        color,
    });
}

async function generarCertificado(nombreEstudiante, nombreCurso) {
    // 1. Leer la plantilla
    const templateBytes = fs.readFileSync('../assets/templates/plantilla1.pdf');
    const pdfDoc = await PDFDocument.load(templateBytes);

    // 2. Fuente (opcional)
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 3. Obtener página
    const page = pdfDoc.getPages()[0];

    drawTextP({
        page,
        text: 'Se le otorga el presente certificado',
        x: 200,
        y: 370,
        font,
        size: 20,
        color: rgb(0.1, 0.1, 0.1),
        is_centered: true
    });

    drawTextP({
        page,
        text: nombreEstudiante,
        x: 200,
        y: 325,
        font: font,
        size: 24,
        color: rgb(0,0,0),
        is_centered: true
    });

    drawTextP({
        page,
        text: 'Por haber culminado satisfactoriamente el curso:',
        x: 200,
        y: 250,
        font: font,
        size: 20,
        color: rgb(0,0,0),
        is_centered: true
    });

    drawTextP({
        page,
        text: nombreCurso,
        x: 200,
        y: 200,
        font: font,
        size: 24,
        color: rgb(0,0,0),
        is_centered: true
    });

    await drawImagesInLine({
        pdfDoc,
        page,
        spacing: 70,
        logos: [
            { path: '../assets/logos/logo1.png', height: 55 },
            { path: '../assets/logos/logo2.png', height: 40 },
            { path: '../assets/logos/logo3.png', height: 50 },
        ],
        y: 420
    });


    // Firmar
    await drawImagesInLine({
        pdfDoc,
        page,
        spacing: 70,
        logos: [
            { path: '../assets/signatures/firma1.jpg', height: 55 },
        ],
        y: 120
    });

    page.drawLine({
        start: { x: 250, y: 125 },
        end: { x: 500, y: 125 },
        thickness: 2, 
        color: rgb(0, 0, 0), 
    });

    drawImageFromBase64({
        pdfDoc,
        page,
        base64:"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",
        x: 250,
        y: 130,
        width: 70,
        height: 70,
    });
        
    // 5. Guardar nuevo PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('../assets/generated/certificado_prueba.pdf', pdfBytes);

    console.log('✅ Certificado generado en /generated');
}

async function generarPDFConCuadricula(templatePath, outputPath) {
  const existingPdfBytes = fs.readFileSync(templatePath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[0];

  const { width, height } = page.getSize();

  // Dibujar líneas horizontales y verticales cada 50 unidades
  for (let x = 0; x < width; x += 50) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    page.drawText(`${x}`, { x: x + 2, y: 5, size: 6, color: rgb(0.5, 0.5, 0.5) });
  }

  for (let y = 0; y < height; y += 50) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: width, y },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    page.drawText(`${y}`, { x: 2, y: y + 2, size: 6, color: rgb(0.5, 0.5, 0.5) });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

async function drawImageFromBase64({ pdfDoc, page, base64, x, y, width, height }) {
  const imageBytes = Buffer.from(base64, 'base64');
  const image = await pdfDoc.embedPng(imageBytes);

  page.drawImage(image, {
    x,
    y,
    width,
    height,
  });
}

generarPDFConCuadricula(
  '../assets/generated/certificado_prueba.pdf',
  '../assets/generated/plantilla-cuadriculada.pdf'
);

// Ejecutar con ejemplo
generarCertificado('Kattherine Hernandez', 'Curso de Backend con Node.js');