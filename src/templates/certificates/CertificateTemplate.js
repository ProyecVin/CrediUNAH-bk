const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const axios = require('axios');
const { 
    drawTextP, 
    drawTextColumnCentered, 
    drawImageFromBase64, 
    drawParagraph, 
    drawRotatedText, 
    drawImagesInLine, 
    toBoldFormat,
    drawImageP
} = require('../../utils/pdfGenerator');
const { formatDateToDayMonthInLetters } = require('../../utils/dateManager');

class CertificateGenerator {
    constructor() {
        if (new.target === CertificateGenerator) {
            throw new Error("Cannot instantiate abstract class");
        }
    }

    async generate({
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
    }) {
        // Load template
        const templateBytes = await this.loadTemplate(templatePath);
        
        // Create PDF document
        const pdfDoc = await PDFDocument.load(templateBytes);
        const page = pdfDoc.getPages()[0];
        
        // Register fontkit
        pdfDoc.registerFontkit(fontkit);
        
        // Load fonts
        const fonts = await this.loadFonts(pdfDoc);
        
        // Draw common elements
        await this.drawCommonElements({
            pdfDoc,
            page,
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
            endDate,
            fonts
        });
        
        // Draw specific elements (implemented by child classes)
        await this.drawSpecificElements({
            pdfDoc,
            page,
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
            endDate,
            fonts
        });
        
        // Save PDF
        const pdfBytes = await pdfDoc.save();
        
        console.log(`✅ ${this.getCertificateType()} de ${studentDNI} generado`);
        
        return {
            pdfBytes,
            fileName: `${studentDNI}.pdf`
        };
    }

    async loadTemplate(templatePath) {
        if (templatePath.startsWith('http')) {
            const response = await axios.get(templatePath, { responseType: 'arraybuffer' });
            return response.data;
        } else {
            console.log(`↓ Cargando plantilla local: ${templatePath}`);
            return await fsp.readFile(templatePath);
        }
    }

    async loadFonts(pdfDoc) {
        throw new Error("Method 'loadFonts' must be implemented");
    }

    async drawCommonElements(params) {
        const { page, fonts, studentName, courseName, operationalUnit, 
                durationInHours, dateInLetters, courseType, logos, 
                signers, is_physically_signed, startDate, endDate, qrBase64, uniqueCode } = params;
        
        // Draw student name
        this.drawStudentName(page, fonts, studentName);
        
        // Draw course type and name
        this.drawCourseInfo(page, fonts, courseName, courseType);
        
        // Draw course details
        this.drawCourseDetails(page, fonts, operationalUnit, durationInHours, startDate, endDate);
        
        // Draw date
        this.drawDate(page, fonts, dateInLetters);
        
        // Draw logos
        await this.drawLogos(params);
        
        // Draw signers
        await this.drawSigners(params);
        
        // Draw QR code if exists
        if (qrBase64) {
            this.drawQRCode(params);
        }
        
        // Draw unique code if exists
        if (uniqueCode) {
            this.drawUniqueCode(params);
        }
    }

    drawStudentName(page, fonts, studentName) {
        throw new Error("Method 'drawStudentName' must be implemented");
    }

    drawCourseInfo(page, fonts, courseName, courseType) {
        throw new Error("Method 'drawCourseInfo' must be implemented");
    }

    drawCourseDetails(page, fonts, operationalUnit, durationInHours, startDate, endDate) {
        throw new Error("Method 'drawCourseDetails' must be implemented");
    }

    drawDate(page, fonts, dateInLetters) {
        throw new Error("Method 'drawDate' must be implemented");
    }

    async drawLogos({ pdfDoc, page, logos }) {
        const logosToDraw = logos.filter(logo => logo.URL).map(logo => ({
            path: logo.URL,
            height: this.getLogoHeight() // Implemented by child classes
        }));

        if (logosToDraw.length > 0) {
            await drawImagesInLine({
                pdfDoc,
                page,
                spacing: this.getLogoSpacing(),
                y: this.getLogoYPosition(),
                images: logosToDraw
            });
        }
    }

    async drawSigners({ pdfDoc, page, signers, is_physically_signed, fonts }) {
        // Draw signature images if physically signed
        if (is_physically_signed) {
            const signatureImages = signers.filter(signer => signer.urlSignature).map(signer => ({
                path: signer.urlSignature,
                height: this.getSignatureHeight()
            }));

            if (signatureImages.length > 0) {
                await drawImagesInLine({
                    pdfDoc,
                    page,
                    spacing: this.getSignatureSpacing(),
                    images: signatureImages,
                    y: this.getSignatureYPosition()
                });
            }
        }

        // Draw signers info
        signers.forEach((signer, index) => {
            const columnWidth = this.getSignerColumnWidth();
            const x1 = this.getSignerXStart() + index * columnWidth;
            const x2 = x1 + columnWidth;

            drawTextColumnCentered({
                page,
                texts: signer.text,
                font: fonts.generalFont,
                size: this.getSignerFontSize(),
                color: rgb(0, 0, 0),
                x1,
                x2,
                yStart: this.getSignerYStart(),
                lineSpacing: this.getSignerLineSpacing()
            });
        });
    }

    drawQRCode({ pdfDoc, page, qrBase64 }) {
        drawImageFromBase64({
            pdfDoc,
            page,
            base64: qrBase64,
            x: this.getQRCodeXPosition(),
            y: this.getQRCodeYPosition(),
            width: this.getQRCodeWidth(),
            height: this.getQRCodeHeight(),
        });
    }

    drawUniqueCode({ page, uniqueCode, fonts }) {
        drawRotatedText({
            page,
            text: uniqueCode,
            x: this.getUniqueCodeXPosition(),
            y: this.getUniqueCodeYPosition(),
            size: this.getUniqueCodeFontSize(),
            font: fonts.generalFontBold,
            color: rgb(0, 0, 0),
            rotate: degrees(90),
        });
    }

    // Abstract methods that must be implemented by child classes
    getCertificateType() {
        throw new Error("Method 'getCertificateType' must be implemented");
    }

    getLogoHeight() {
        throw new Error("Method 'getLogoHeight' must be implemented");
    }

    getLogoSpacing() {
        throw new Error("Method 'getLogoSpacing' must be implemented");
    }

    getLogoYPosition() {
        throw new Error("Method 'getLogoYPosition' must be implemented");
    }

    getSignatureHeight() {
        throw new Error("Method 'getSignatureHeight' must be implemented");
    }

    getSignatureSpacing() {
        throw new Error("Method 'getSignatureSpacing' must be implemented");
    }

    getSignatureYPosition() {
        throw new Error("Method 'getSignatureYPosition' must be implemented");
    }

    getSignerColumnWidth() {
        throw new Error("Method 'getSignerColumnWidth' must be implemented");
    }

    getSignerXStart() {
        throw new Error("Method 'getSignerXStart' must be implemented");
    }

    getSignerFontSize() {
        throw new Error("Method 'getSignerFontSize' must be implemented");
    }

    getSignerYStart() {
        throw new Error("Method 'getSignerYStart' must be implemented");
    }

    getSignerLineSpacing() {
        throw new Error("Method 'getSignerLineSpacing' must be implemented");
    }

    getQRCodeXPosition() {
        throw new Error("Method 'getQRCodeXPosition' must be implemented");
    }

    getQRCodeYPosition() {
        throw new Error("Method 'getQRCodeYPosition' must be implemented");
    }

    getQRCodeWidth() {
        throw new Error("Method 'getQRCodeWidth' must be implemented");
    }

    getQRCodeHeight() {
        throw new Error("Method 'getQRCodeHeight' must be implemented");
    }

    getUniqueCodeXPosition() {
        throw new Error("Method 'getUniqueCodeXPosition' must be implemented");
    }

    getUniqueCodeYPosition() {
        throw new Error("Method 'getUniqueCodeYPosition' must be implemented");
    }

    getUniqueCodeFontSize() {
        throw new Error("Method 'getUniqueCodeFontSize' must be implemented");
    }

    async drawSpecificElements(params) {
        // Can be optionally implemented by child classes for specific elements
    }
}

module.exports = CertificateGenerator;