const fs = require('fs');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fsp = require('fs/promises');
const path = require('path');
const { default: isURL } = require('validator/lib/isURL');
const axios = require('axios');

/**
 * Draw an image in document
 * @param {*} param0 
 */
const drawImageP = async ({ pdfDoc, page, imagePath, x, y, height }) => {
    
    let imageBytes;
    try {
        // Get image bytes
        if (isURL(imagePath)) {
            const response = await axios.get(imagePath, { 
                responseType: 'arraybuffer',
                headers: { 'Accept': 'image/png,image/jpeg' } // Fuerza tipo de imagen
            });
            imageBytes = response.data;
        } else {
            imageBytes = fs.readFileSync(imagePath);
        }

        // Detect format
        let image;
        const byteSignature = imageBytes.slice(0, 4).toString('hex');

        // PNG: \x89PNG | JPG: \xff\xd8\xff\xe0
        if (byteSignature.startsWith('89504e47') || imagePath.includes('-png')) {
            image = await pdfDoc.embedPng(imageBytes);
        } else if (byteSignature.startsWith('ffd8ffe0') || imagePath.includes('.jpg')) {
            image = await pdfDoc.embedJpg(imageBytes);
        } else {
            // Automatic
            try {
                image = await pdfDoc.embedPng(imageBytes);
            } catch {
                image = await pdfDoc.embedJpg(imageBytes);
            }
        }

        const scale = height / image.height;
        const width = image.width * scale;

        // Drawing
        page.drawImage(image, { x, y, width, height });

    } catch (error) {
        console.error('[ERROR] Fallo al procesar imagen:', {
            url: imagePath,
            error: error.message
        });
        throw new Error(`No se pudo cargar la imagen: ${error.message}`);
    }
};

/**
 * Draw many images centered in line.
 * @param {*} param0 
 */
const drawImagesInLine = async ({ pdfDoc, page, images, y = 700, spacing = 30 }) => {
  // Load all images
  const imageBuffers = await Promise.all(
    images.map(async (img) => {
      if (img.path.startsWith('http')) {
        // In case remote URL
        const response = await axios.get(img.path, { responseType: 'arraybuffer' });
        return {
          buffer: response.data,
          path: img.path
        };
      } else {
        // In case local file
        return {
          buffer: await fsp.readFile(path.resolve(img.path)),
          path: img.path
        };
      }
    })
  );

  // Embed images
  const embeddedImages = await Promise.all(
    imageBuffers.map(async ({ buffer, path }) => {
      try {
        // Try as PNG
        return await pdfDoc.embedPng(buffer);
      } catch (e) {
        try {
          // Try as JPG
          return await pdfDoc.embedJpg(buffer);
        } catch (e) {
          console.error(`No se pudo cargar la imagen: ${path}`);
          throw new Error(`Formato no soportado para imagen: ${path}`);
        }
      }
    })
  );

  const scaledImages = embeddedImages.map((img, index) => {
    const height = images[index].height;
    const scale = height / img.height;
    return {
      image: img,
      width: img.width * scale,
      height,
    };
  });

  // Calculate initial position
  const totalWidth = scaledImages.reduce((acc, img) => acc + img.width, 0) + 
                     spacing * (scaledImages.length - 1);
  const pageWidth = page.getWidth();
  let x = (pageWidth - totalWidth) / 2;

  // Drawing images
  for (const img of scaledImages) {
    await page.drawImage(img.image, {
      x,
      y,
      width: img.width,
      height: img.height,
    });
    x += img.width + spacing;
  }
};

/**
 * Draw text. It can be centered if you decide.
 * @param {*} param0 
 */
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

/**
 * Draw text. It can be rotated in degrees if you decide.
 * @param {*} param0 
 */
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

/**
 * Draw text centered in columns.
 * @param {*} param0 
 */
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

/**
 * Generate a Layout of Template in grid format.
 * @param {*} templatePath 
 * @param {*} outputPath 
 */
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

/**
 * Draw an image from base64 format 
 * @param {*} param0 
 */
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