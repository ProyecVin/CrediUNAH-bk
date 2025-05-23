const fs = require('fs');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fsp = require('fs/promises');
const path = require('path');

const drawImageP = async ({pdfDoc, page, imagePath, x, y, height}) => {
    console.log(imagePath);

    const imageBytes = fs.readFileSync(imagePath);

    // Detecta el formato automáticamente
    const extension = path.extname(imagePath).toLowerCase();
    let image;

    if (extension === ".png") {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (extension === ".jpg" || extension === ".jpeg") {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      throw new Error("Formato de imagen no soportado. Usa .png o .jpg");
    }

    // Escalar altura
    const scale = height / image.height;
    const width = image.width * scale;

    page.drawImage(image, {
      x,
      y,
      width,
      height,
    });
  };

  /**
   * Inserta varios logos centrados horizontalmente en una página PDF, cada uno con su altura especificada.
   * @param {Object} options
   * @param {PDFDocument} options.pdfDoc - Documento PDF
   * @param {PDFPage} options.page - Página donde se dibujarán los logos
   * @param {{ path: string, height: number }[]} options.logos - Lista de rutas locales con altura por imagen
   * @param {number} [options.y=700] - Posición vertical donde colocarlos
   */
  const drawImagesInLine = async ({ pdfDoc, page, logos, y = 700, spacing = 30 }) => {
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

  const drawTextP = async ({ page, text, x, y, font, size, color, is_centered = false }) => {

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

const drawRotatedText = ({ page, text, x, y, font, size, color }) => {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color,
    rotate: degrees(90),
  });
};

const drawTextColumnCentered = ({ page, texts, font, size, color, x1, x2, yStart, lineSpacing }) => {
  texts.forEach((text, index) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = x1 + ((x2 - x1) - textWidth) / 2;
    const y = yStart - (index * lineSpacing);

    page.drawText(text, {
      x,
      y,
      size,
      font,
      color,
    });
  });
};

const generatePDFGridLayout = async (templatePath, outputPath) => {
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

const drawImageFromBase64 = async ({ pdfDoc, page, base64, x, y, width, height }) => {
  const imageBytes = Buffer.from(base64, 'base64');
  const image = await pdfDoc.embedPng(imageBytes);

  page.drawImage(image, {
    x,
    y,
    width,
    height,
  });
}

module.exports = {
  drawImagesInLine,
  drawTextP,
  generatePDFGridLayout,
  drawImageFromBase64,
  drawTextColumnCentered,
  drawImageP,
  drawRotatedText
}