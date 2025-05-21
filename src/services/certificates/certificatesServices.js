const certificateModel = require('../../models/certificates/certificateModel.js');
const certificateTypeModel = require('../../models/certificate_types/CertificateTypeModel.js');
const certificateLogoModel = require('../../models/logos/CertificateLogoModel.js');
const courseModel = require('../../models/courses/courseModel.js');
const enrollmentModel = require('../../models/enrollments/EnrollmentModel.js')
const signatureModel = require('../../models/signatures/SignatureModel.js');

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
                const logos = await certificateLogoModel.getLogosByCourseAndCertificateType(courseId, certificateType.CERTIFICATE_TYPE_ID);

                // Getting Signatures
                const signatures = await signatureModel.getSignaturesByCourseAndCertificateType(courseId, certificateType.CERTIFICATE_TYPE_ID);

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
}

module.exports = new CertificateServices();