const certificateModel = require('../../models/certificates/certificateModel.js');
const certificateTypeModel = require('../../models/certificate_types/CertificateTypeModel.js');
const certificateLogoModel = require('../../models/logos/CertificateLogoModel.js');
const courseModel = require('../../models/courses/courseModel.js');
const enrollmentModel = require('../../models/enrollments/EnrollmentModel.js')
const signatureModel = require('../../models/signatures/SignatureModel.js');

const templateMapper = require('../../templates/templateMapper.js');

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
            // Get info for certificates
            const certificateInfo = await CertificateServices.getInfoForCertificate(courseId, this.courseModel, this.enrollmentModel, this.certificateTypeModel, this.certificateLogoModel, this.signatureModel);

            // Generating certificates for each enrollment following stablished parameters 
            certificateInfo.certificates.map(async (certificate) => {
                const templateKey = certificate.CERTIFICATE_TYPE_ID;
            });

            return certificateInfo;
            
        } catch (error) {
            console.error('Error generating certificates:', error);
            return error.message;
        }
    }

    // Get all info for certificates by course
    static getInfoForCertificate = async (courseId, courseModel, enrollmentModel, certificateTypeModel, certificateLogoModel, signatureModel) => {
        // Get course info
        const course = await courseModel.getCourseInfoForCertificates(courseId);

        // Get all enrollments for course
        const enrollments = await enrollmentModel.getAllCourseEnrollments(courseId);

        // Get all types of certificates of course Id
        const certificateTypes = await certificateTypeModel.getAllCertificateTypesByCourse(courseId);
        
        // Get logos and signatures for each certificate type
        const result = await Promise.all(
            certificateTypes.map(async (certificateType) => {

                // Getting logos
                const logos = await certificateLogoModel.getLogosByCourseAndCertificateType(courseId, certificateType.certificateTypeId);

                // Getting Signatures
                const signatures = await signatureModel.getSignaturesByCourseAndCertificateType(courseId, certificateType.certificateTypeId);

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

    /**
     * Private Method to generate every certificate type for each enrollment following stablished parameters 
     * of evaluation an course completion
     * @param {*} certificateTypeId 
     * @param {*} courseId 
     * @param {*} enrollments 
     */
    _generateCertificates = async (certificateTypeId, courseId, enrollments) => {

    }
}

module.exports = new CertificateServices();