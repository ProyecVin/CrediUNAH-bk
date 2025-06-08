const certificateModel = require('../../models/certificates/CertificateModel.js');
const certificateTypeModel = require('../../models/certificate_types/CertificateTypeModel.js');
const certificateLogoModel = require('../../models/logos/CertificateLogoModel.js');
const courseModel = require('../../models/courses/courseModel.js');
const enrollmentModel = require('../../models/enrollments/EnrollmentModel.js')
const signatureModel = require('../../models/signatures/SignatureModel.js');

const templateMapper = require('../../templates/templateMapper.js');

const path = require('path');
const { getDateInLetters } = require('../../utils/dateManager.js');
const { generateQRCode, extractBase64 } = require('../../utils/qrcodeManager.js');
const { uploadFileToS3 } = require('../../utils/s3Client.js');
const { saveMedia } = require('../../models/media/MediaModel.js');

const fs = require('fs');

class CertificateServices {

    constructor() {
        this.certificateModel = certificateModel;
        this.certificateTypeModel = certificateTypeModel;
        this.certificateLogoModel = certificateLogoModel;
        this.courseModel = courseModel;
        this.enrollmentModel = enrollmentModel;
        this.signatureModel = signatureModel;
    }

    async generateCourseCertificates(courseId) {
        try {
            const generated = {}; 
            const failed = {};    

            let { courseInfo, enrollments, certificates } = await this.getInfoForCertificate(courseId);
            courseInfo = courseInfo[0];

            let correlative = courseInfo.certifyingOpUnitCertificateIssued + 1;
            const courseNameAbb = this.generateCourseAbbreviation(courseInfo.courseName); // Course Name Abbreviature

            const issueDate = new Date();

            for (const certificate of certificates) {

                const certificateType = certificate.certificateType;
                const templateKey = certificateType.certificateTypeId;

                if (!templateMapper[templateKey]) {
                    console.warn(`No hay plantilla configurada para: ${templateKey}`);
                    continue;
                }

                const templateConfig = templateMapper[templateKey];
                const generate = templateConfig.generate;

                const signers = this.parseSigners(certificate.signatures);

                const is_physically_signed = await this.signatureModel.isPhysicallySigned(courseId, templateKey);

                // Inicializar arrays si no existen para ese tipo de certificado
                if (!generated[templateKey]) generated[templateKey] = [];
                if (!failed[templateKey]) failed[templateKey] = [];

                for (const enroll of enrollments) {

                    const QRData = await generateQRCode('https://www.who.int/es/news-room/fact-sheets/detail/food-safety');
                    const qrCode = extractBase64(QRData);

                    let uniqueCode = this.generateCertificateCode(courseInfo.certifyingOpUnitId, courseNameAbb, issueDate, correlative);

                    try {
                        let file = await generate({
                            templatePath: templateConfig.defaultTemplateUrl,
                            studentDNI: enroll.studentDNI,
                            studentName: enroll.studentName, 
                            skills: courseInfo.skills, 
                            courseName: courseInfo.courseName, 
                            operationalUnit: courseInfo.operationalUnitName, 
                            durationInHours: courseInfo.durationInHours, 
                            dateInLetters:  getDateInLetters(new Date('2025-05-30')),// getDateInLetters(issueDate),
                            courseType: courseInfo.courseTypeName,
                            logos: certificate.logos,
                            signers,
                            qrBase64: qrCode,
                            uniqueCode,
                            is_physically_signed: is_physically_signed[0].is_physically_signed,
                            startDate: courseInfo.startDate,
                            endDate: courseInfo.endDate
                        });

                        const localPath = path.join(__dirname, `../../assets/generated/${templateKey}`, file.fileName);
                        console.log(`Guardando certificado en: ${localPath}`);
                        fs.writeFileSync(localPath, file.pdfBytes);

                        // Guardar certificado en S3
                        let fileURL = await uploadFileToS3(
                            `courses/${courseInfo.courseName}/${templateKey}/${file.fileName}`, 
                            file.pdfBytes, 
                            false
                        );

                        // Guardar URL en Media
                        let  media = await saveMedia(file.fileName, fileURL, 5, `${templateKey} de ${enroll.studentDNI}.`)

                        // Guardar certificado en base de datos
                        let result = await this.certificateModel.saveCertificate(enroll.enrollmentId, uniqueCode, media.mediaId, 1, templateKey);
                        console.log(result);

                        // Pendiente 
                        // Actualizar cantidad de certificados emitidos por unidad certificadora
                        // Logica para evitar duplicidad
                        // Criterio de aprobación para emisión de certificado

                        generated[templateKey].push({ student: enroll.studentDNI });
                        correlative ++;

                    } catch (error) {

                        failed[templateKey].push({
                            studentDni: enroll.studentDNI,
                            error: error.message
                        });

                        console.log(error);
                    }
                }
            }

            return {
                resumen: Object.keys(generated).map(templateKey => ({
                    tipo: templateKey,
                    emitidos: generated[templateKey].length,
                    fallidos: failed[templateKey]?.length || 0
                })),
                detalle_exitosos: generated,
                detalle_fallidos: failed
            };


        } catch (error) {
            console.error('Error generating certificates:', error);
            return { error: error.message };
        }
    }

    // Get all info for certificates by course
    getInfoForCertificate = async (courseId) => {
        // Get course info
        const course = await this.courseModel.getCourseInfoForCertificates(courseId);

        // Get all enrollments for course
        const enrollments = await this.enrollmentModel.getAllCourseEnrollments(courseId);

        // Get all types of certificates of course Id
        const certificateTypes = await this.certificateTypeModel.getAllCertificateTypesByCourse(courseId);
        
        // Get logos and signatures for each certificate type
        const result = await Promise.all(
            certificateTypes.map(async (certificateType) => {

                // Getting logos
                const logos = await this.certificateLogoModel.getLogosByCourseAndCertificateType(courseId, certificateType.certificateTypeId);

                // Getting Signatures
                const signatures = await this.signatureModel.getSignaturesByCourseAndCertificateType(courseId, certificateType.certificateTypeId);

                return {
                    certificateType,
                    logos,
                    signatures
                };
            })
        );

        return {
            courseInfo: course,
            enrollments,
            certificates: result
        };
    }

    parseSigners = (signatures) => {
        return signatures.map(signature => ({
            urlSignature: 'https://linkage-storage.s3.us-east-1.amazonaws.com/images/firma1.jpg', // URL fija (ajusta según necesites)
            text: [
                signature.signerName,
                ...signature.signerTitle.split(',').map(title => title.trim())
            ]
        }));
    }

    generateCertificateCode = (certifierCode, courseCode, issueDate, startCount) => {
        // Extract month and year from date
        const month = String(issueDate.getMonth() + 1).padStart(2, '0');
        const year = issueDate.getFullYear();
        
        // Format correlative with leading zeros
        const correlative = String(startCount).padStart(3, '0');
        
        return `${certifierCode}-${courseCode}-${month}-${year}-${correlative}`;
    }

    generateCourseAbbreviation = (courseName) => {
        const ignoreWords = ['de', 'y', 'en', 'el', 'para', 'a'];
        const keywords = courseName.split(' ')
            .filter(word => !ignoreWords.includes(word.toLowerCase()))
            .map(word => word.toUpperCase());

        // Get first 3 letters from initials (e.g., "F" + "S" + "H" → "FSH")
        let abbr = keywords.slice(0, 3).map(word => word[0]).join('');

        // Add 3 more letters from the first keyword (e.g., "FOO" from "Food")
        if (keywords.length > 0 && keywords[0].length >= 3) {
            abbr += keywords[0].substring(0, 3);
        } else {
            abbr = abbr.padEnd(6, 'X'); // Pad if needed
        }

        return abbr.slice(0, 6); // Ensure 6 characters
    }

}

module.exports = new CertificateServices();