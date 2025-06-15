const fs = require('fs');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fsp = require('fs/promises');
const path = require('path');
const { default: isURL } = require('validator/lib/isURL');
const axios = require('axios');
const sharp = require('sharp');
const fontkit = require('@pdf-lib/fontkit');

/**
 * Draw an image in document
 * @param {*} param0 
 */
const drawImageP = async ({ pdfDoc, page, imagePath, x, y, height, grayscale = false }) => {
    let imageBytes;

    try {
        // Obtener bytes de imagen
        if (isURL(imagePath)) {
            const response = await axios.get(imagePath, { 
                responseType: 'arraybuffer',
                headers: { 'Accept': 'image/png,image/jpeg' }
            });
            imageBytes = response.data;
        } else {
            imageBytes = fs.readFileSync(imagePath);
        }

        // Convertir a blanco y negro si se solicita
        if (grayscale) {
            imageBytes = await sharp(imageBytes)
                        .grayscale()
                        .toBuffer();
        }

        // Detectar formato real o forzar PNG si se procesó
        let image;
        const byteSignature = imageBytes.slice(0, 4).toString('hex');
        if (byteSignature.startsWith('89504e47') || grayscale) {
            image = await pdfDoc.embedPng(imageBytes);
        } else if (byteSignature.startsWith('ffd8ffe0') || imagePath.includes('.jpg')) {
            image = await pdfDoc.embedJpg(imageBytes);
        } else {
            try {
                image = await pdfDoc.embedPng(imageBytes);
            } catch {
                image = await pdfDoc.embedJpg(imageBytes);
            }
        }

        // Escalado
        const scale = height / image.height;
        const width = image.width * scale;

        // Dibujar en el PDF
        page.drawImage(image, { x, y, width, height });

    } catch (error) {
        console.error('[ERROR] Fallo al procesar imagen:', {
            url: imagePath,
            error: error.message
        });
        throw new Error(`No se pudo cargar la imagen: ${error.message}`);
    }
};

const drawImagesAligned = async ({
  pdfDoc,
  page,
  images, // [{ path, height }]
  y = 700,
  spacing = 30,
  align = 'center',
  marginStart = 0, // se aplica solo si align === 'left'
  marginEnd = 0,   // se aplica solo si align === 'right'
  grayscale = false
}) => {
  // Cargar imágenes desde archivos locales o URLs remotas, con opción a grayscale
  const imageBuffers = await Promise.all(
    images.map(async (img) => {
      let buffer;

      if (img.path.startsWith('http')) {
        const response = await axios.get(img.path, { responseType: 'arraybuffer' });
        buffer = response.data;
      } else {
        buffer = await fsp.readFile(path.resolve(img.path));
      }

      if (grayscale) {
        buffer = await sharp(buffer).grayscale().toBuffer();
      }

      return {
        buffer,
        path: img.path
      };
    })
  );

  // Incrustar imágenes
  const embeddedImages = await Promise.all(
    imageBuffers.map(async ({ buffer, path }) => {
      try {
        return await pdfDoc.embedPng(buffer);
      } catch {
        try {
          return await pdfDoc.embedJpg(buffer);
        } catch {
          console.error(`No se pudo cargar la imagen: ${path}`);
          throw new Error(`Formato no soportado para imagen: ${path}`);
        }
      }
    })
  );

  // Escalar imágenes
  const scaledImages = embeddedImages.map((img, index) => {
    const height = images[index].height;
    const scale = height / img.height;
    return {
      image: img,
      width: img.width * scale,
      height,
    };
  });

  // Calcular ancho total con espaciado
  const totalWidth = scaledImages.reduce((acc, img) => acc + img.width, 0) +
                     spacing * (scaledImages.length - 1);
  const pageWidth = page.getWidth();

  // Calcular punto inicial según alineación
  let x;
  if (align === 'left') {
    x = marginStart;
  } else if (align === 'right') {
    x = pageWidth - totalWidth - marginEnd;
  } else {
    x = (pageWidth - totalWidth) / 2;
  }

  // Dibujar imágenes
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

const drawParagraph = ({ 
    page, 
    font, 
    boldFont, 
    text, 
    x1, 
    x2, 
    y, 
    fontSize, 
    lineHeight = 1.2, 
    center = false 
}) => {
    const maxWidth = x2 - x1;
    const segments = [];
    let isBold = false;

    // 1. Procesar texto: unir signos de puntuación a palabras anteriores
    const punctuation = [',', '.', ';', ':', '!', '?', ')', ']', '}'];
    let remainingText = text.replace(/\s+/g, ' ').trim(); // Elimina espacios dobles

    while (remainingText.length > 0) {
        if (remainingText.startsWith("**")) {
            isBold = !isBold;
            remainingText = remainingText.slice(2);
        } else {
            const nextBold = remainingText.indexOf("**");
            const end = nextBold >= 0 ? nextBold : remainingText.length;
            let chunk = remainingText.slice(0, end);

            // Dividir en palabras y signos de puntuación
            const words = [];
            let currentWord = '';
            for (const char of chunk) {
                if (punctuation.includes(char)) {
                    if (currentWord) {
                        words.push(currentWord);
                        currentWord = '';
                    }
                    words.push(char);
                } else if (char === ' ') {
                    if (currentWord) {
                        words.push(currentWord);
                        currentWord = '';
                    }
                    words.push(' ');
                } else {
                    currentWord += char;
                }
            }
            if (currentWord) words.push(currentWord);

            // Crear segmentos
            for (const word of words) {
                if (word === ' ') continue; // Ignorar espacios (los manejamos después)
                segments.push({
                    text: word,
                    isBold,
                    width: (isBold ? boldFont : font).widthOfTextAtSize(word, fontSize),
                    isPunctuation: punctuation.includes(word),
                });
            }

            remainingText = remainingText.slice(end);
        }
    }

    // 2. Construir líneas (uniendo palabras con puntuación)
    const lines = [];
    let currentLine = [];
    let currentWidth = 0;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const nextSegment = segments[i + 1];
        const spaceWidth = font.widthOfTextAtSize(" ", fontSize);

        // Si es puntuación, unirla al segmento anterior
        if (segment.isPunctuation && currentLine.length > 0) {
            const lastSegment = currentLine[currentLine.length - 1];
            lastSegment.text += segment.text;
            lastSegment.width += segment.width;
            continue;
        }

        // Calcular ancho total (incluyendo espacio si no es puntuación)
        let totalWidth = currentWidth + segment.width;
        if (currentLine.length > 0 && !segment.isPunctuation) {
            totalWidth += spaceWidth;
        }

        if (totalWidth <= maxWidth) {
            currentLine.push(segment);
            currentWidth = totalWidth;
        } else {
            lines.push(currentLine);
            currentLine = [segment];
            currentWidth = segment.width;
        }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    // 3. Dibujar líneas
    let currentY = y;
    for (const line of lines) {
        let lineWidth = line.reduce((sum, seg) => sum + seg.width, 0);
        // Añadir espacios solo entre palabras (no después de puntuación)
        let spaceCount = 0;
        for (let i = 1; i < line.length; i++) {
            if (!line[i].isPunctuation && !line[i - 1].isPunctuation) {
                spaceCount++;
            }
        }
        lineWidth += spaceCount * font.widthOfTextAtSize(" ", fontSize);

        let currentX = center ? x1 + (maxWidth - lineWidth) / 2 : x1;

        for (let i = 0; i < line.length; i++) {
            const segment = line[i];
            // Añadir espacio solo si no es puntuación y no es el primer segmento
            if (i > 0 && !segment.isPunctuation && !line[i - 1].isPunctuation) {
                currentX += font.widthOfTextAtSize(" ", fontSize);
            }

            page.drawText(segment.text, {
                x: currentX,
                y: currentY,
                size: fontSize,
                font: segment.isBold ? boldFont : font,
                color: rgb(0, 0, 0),
            });
            currentX += segment.width;
        }

        currentY -= fontSize * lineHeight;
    }

    return currentY;
};

/**
 * Converts a plain text string to bold format (Markdown-style).
 * Example: "Hello world" → "**Hello** **world**"
 * 
 * @param {string} text - The text to convert.
 * @returns {string} - The text with each word in bold.
 */
const toBoldFormat = (text) => {
    return text
        .split(/\s+/) // split by one or more spaces
        .filter(word => word.trim() !== '') // remove empty words
        .map(word => `**${word}**`) // wrap each word in asterisks
        .join(' '); // rejoin the words with spaces
}

module.exports = {
  drawImagesAligned,
  drawTextP,
  generatePDFGridLayout,
  drawImageFromBase64,
  drawTextColumnCentered,
  drawImageP,
  drawRotatedText,
  drawParagraph,
  toBoldFormat
}