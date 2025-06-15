const certificateModel = require('../../models/certificates/certificateModel');
const certificateTypeModel = require('../../models/certificate_types/CertificateTypeModel');
const certificateLogoModel = require('../../models/logos/CertificateLogoModel');
const courseModel = require('../../models/courses/courseModel.js');
const enrollmentModel = require('../../models/enrollments/EnrollmentModel')
const signatureModel = require('../../models/signatures/SignatureModel');
const courseStatusHistoryModel = require('../../models/courses/CourseStatusHistoryModel.js');

const templateMapper = require('../../templates/templateMapper');

const path = require('path');
const { getDateInLetters, getDateInAmericaCentral } = require('../../utils/dateManager.js');
const { generateQRCode, extractBase64 } = require('../../utils/qrcodeManager.js');
const { uploadFileToS3 } = require('../../utils/s3Client.js');
const { saveMedia } = require('../../models/media/MediaModel.js');
const { generateCertificateCode, generateCourseAbbreviation, parseSigners } = require('../../utils/certificatesManager.js');

const fs = require('fs');
const { updateIssuedCertificatesAccount } = require('../../models/operational/OperationalUnitsModel.js');

const CERTIFICATES_GENERATED_STATUS_ID = 7;
class CertificateServices {

    constructor() {
        this.certificateModel = certificateModel;
        this.certificateTypeModel = certificateTypeModel;
        this.certificateLogoModel = certificateLogoModel;
        this.courseModel = courseModel;
        this.enrollmentModel = enrollmentModel;
        this.signatureModel = signatureModel;
        this.courseStatusHistoryModel = courseStatusHistoryModel;
    }

    async generateCourseCertificates(courseId) {
        try {
            const generated = {}; 
            const failed = {};    

            let { courseInfo, enrollments, certificates } = await this.getInfoForCertificate(courseId);

            courseInfo = courseInfo[0];

            let correlative = courseInfo.certifyingOpUnitCertificateIssued + 1;
            const courseNameAbb = generateCourseAbbreviation(courseInfo.courseName); // Course Name Abbreviature

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

                const signers = parseSigners(certificate.signatures);

                const is_physically_signed = await this.signatureModel.isPhysicallySigned(courseId, templateKey);

                // Inicializar arrays si no existen para ese tipo de certificado
                if (!generated[templateKey]) generated[templateKey] = [];
                if (!failed[templateKey]) failed[templateKey] = [];

                for (const enroll of enrollments) {

                    // Validate if enrollment has already been issued a certificate for this type
                    let result = await certificateModel.isCertificateIssued(enroll.enrollmentId, templateKey);
                    const count = result[0]?.result || 0;

                    if (count !== 1){

                        if (!templateConfig.validate(enroll)) {
                            console.log(`Estudiante ${enroll.studentDNI} no cumple criterios para ${templateKey}`);
                            continue;
                        }
                        
                        const QRData = await generateQRCode('https://www.who.int/es/news-room/fact-sheets/detail/food-safety');
                        const qrCode = extractBase64(QRData);

                        let uniqueCode = generateCertificateCode(courseInfo.certifyingOpUnitId, courseNameAbb, issueDate, correlative);

                        try {
                            let file = await generate({
                                templatePath: templateConfig.defaultTemplateUrl,
                                studentDNI: enroll.studentDNI,
                                studentName: enroll.studentName, 
                                skills: courseInfo.skills, 
                                courseName: courseInfo.courseName, 
                                operationalUnit: courseInfo.operationalUnitName, 
                                durationInHours: courseInfo.durationInHours, 
                                dateInLetters:  getDateInLetters(new Date()),
                                courseType: courseInfo.courseTypeName,
                                logos: certificate.logos,
                                signers,
                                qrBase64: qrCode,
                                uniqueCode,
                                is_physically_signed: is_physically_signed[0].is_physically_signed,
                                startDate: courseInfo.startDate,
                                endDate: courseInfo.endDate
                            });

                            // Saving the certificate in database, S3 and local
                            this.saveCertificate(templateKey, file, courseInfo, enroll, uniqueCode);

                            // Updating certificates issued count
                            correlative ++;
                            await updateIssuedCertificatesAccount(courseInfo.certifyingOpUnitId, correlative);

                            // Logica para evitar duplicidad // pendiente

                            generated[templateKey].push({ student: enroll.studentDNI });

                        } catch (error) {

                            failed[templateKey].push({
                                studentDni: enroll.studentDNI,
                                error: error.message
                            });

                            console.log(error);
                        }
                    } else {
                        console.log(`El certificado de ${enroll.studentDNI} ya ha sido emitido para ${templateKey}`);
                    }

                }
            }

            // Update course status to "Certificados Generados"
            await this.courseStatusHistoryModel.updateCourseStatus(courseId, CERTIFICATES_GENERATED_STATUS_ID);
            console.log('Certificados generados exitosamente');

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

    saveCertificate = async (templateKey, file, courseInfo, enroll, uniqueCode) => {
        try {
            // Save certificate in local storage (only for development)
            if (process.env.NODE_ENV === 'development') {
                const localPath = path.join(__dirname, `../../assets/generated/${templateKey}`, file.fileName);
                console.log(`Guardando certificado en: ${localPath}`);
                fs.writeFileSync(localPath, file.pdfBytes);
            }

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
        } catch (error) {
            console.error('Error saving certificate:', error);
            throw new Error('Error saving certificate: ' + error.message);
        }
    }
}

module.exports = new CertificateServices();