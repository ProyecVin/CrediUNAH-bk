const certificateModel = require('../../models/certificates/certificateModel.js');
const certificateTypeModel = require('../../models/certificate_types/CertificateTypeModel.js');
const certificateLogoModel = require('../../models/logos/CertificateLogoModel.js');
const courseModel = require('../../models/courses/courseModel.js');
const enrollmentModel = require('../../models/enrollments/EnrollmentModel.js')
const signatureModel = require('../../models/signatures/SignatureModel.js');

const templateMapper = require('../../templates/templateMapper.js');

const path = require('path');

class CertificateServices{

    constructor(){
        this.certificateModel = certificateModel;
        this.certificateTypeModel = certificateTypeModel;
        this.certificateLogoModel = certificateLogoModel;
        this.courseModel = courseModel;
        this.enrollmentModel = enrollmentModel;
        this.signatureModel = signatureModel;
    }

    async generateCourseCertificates(courseId) {
        try {
            const generated = [];
            const failed = [];

            // Get info for certificates
            const { courseInfo, enrollments, certificates } = await this.getInfoForCertificate(courseId);
            const course = courseInfo[0];

            // Generating certificates for each enrollment following stablished parameters 
            certificates.map(async (certificate) => {
                const certificateType = certificate.certificateType;
                const templateKey = certificateType.certificateTypeId;

                if (!templateMapper[templateKey]) {
                    console.warn(`No hay plantilla configurada para: ${templateKey}`);
                }
                
                // specific configuration from mapper
                const templateConfig = templateMapper[templateKey];

                const generate = templateConfig.generate;

                // Signers
                const signers = [
                    {
                        "urlSignature": 'https://linkage-storage.s3.us-east-1.amazonaws.com/images/firma1.jpg', // path.resolve(__dirname, '../../assets/images/signatures/firma1.jpg'),
                        "text": ['MSc. Guadalupe Nuñez Salgado', 'Coordinadora Académica', 'Coordinadora de Vinculación', 'Facultad de Ingeniería'],
                    },
                    {
                        "urlSignature": path.resolve(__dirname, '../../assets/images/signatures/firma1.jpg'),
                        "text": ['Dr. Miguel Ezequiel Padilla', 'Jefe del departamento de Ingeniería Química', 'Facultad de Ingeniería'],
                    },
                    {
                        "urlSignature": path.resolve(__dirname, '../../assets/images/signatures/firma1.jpg'),
                        "text": ['MSc. Jorge Maynor Vargas', 'Coordinador del curso de Inocuidad de alimentos', 'Docente del Departamento de Ingeniería Química', 'Facultad de Ingeniería']
                    }
                ];

                enrollments.forEach( async (enroll) => {
                    try {
                        await generate({
                            templatePath: templateConfig.defaultTemplateUrl,
                            studentDNI: enroll.studentDNI,
                            studentName: enroll.studentName, 
                            skills: ' producir alimentos inocuos', 
                            courseName: 'inocuidad de alimentos', 
                            operationalUnit: 'Departamento de Ingeniería Química', 
                            durationInHours: 40, 
                            dateInLetters: '15 de diciembre del año 2023',
                            courseType: 'curso',
                            logoPath: 'https://dircom.unah.edu.hn/dmsdocument/13698-ingenieria-quimica-industrial-color-png',
                            signers,
                            qrBase64: "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",
                            uniqueCode: 'CV-052025001'
                        })
                    
                        generated.push({student: enroll.studentDNI});

                    } catch (error) {
                        failed.push({
                            studentDni: enroll.studentDNI,
                            error: error.message
                        });

                        console.log(error);

                        return error;
                    }
                    
                });
            });

            return {
                generated,
                failed
            };
            
        } catch (error) {
            console.error('Error generating certificates:', error);
            return error.message;
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

    prepareCertificateParams({ course, enrollment, certificateType, certificateData }) {
        return {
            templatePath: 'https://linkage-storage.s3.us-east-1.amazonaws.com/templates/certAprFacuInge01.pdf',
            studentName: enrollment.studentName,
            studentDNI: enrollment.studentDNI,
            skills: 'nciwhnehcnwhencew',
            courseName: course.courseName,
            operationalUnit: course.operationalUnitName,
            durationInHours: 40,
            dateInLetters: this.formatDateToLetters(new Date()),
            courseType: 'curso',
            logoPath: certificateData.logos[0]?.URL,
            signers: certificateData.signatures.map(sig => ({
                urlSignature: sig.URL,
                text: [sig.signerName, sig.signerTitle].filter(Boolean)
            })),
            qrBase64: this.generateQRCode('jqduhqwudhuqwhdu'),
            uniqueCode: 'jkdhedyhqwdiygyqwbeiyt'
        };
    }

}

module.exports = new CertificateServices();