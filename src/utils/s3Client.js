const s3Config = require('../config/s3.config');
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const { url } = require('inspector');
const path = require('path');

const client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

/**
 * Generate a public URL for a file in S3
 * @param {*} filePath 
 * @returns 
 */
const getPublicUrl = (filePath) => {
    const encodedFilePathName = encodeURIComponent(filePath);
    const publicUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${encodedFilePathName}`;

    return publicUrl;
}

/**
* Upload a file to S3
* @param {*} filePath 
* @param {*} file 
* @param {*} isPrivate 
* @returns 
*/
const uploadFileToS3 = async (filePath, fileContent, isPrivate = false) => {

    // Deternime content type
    const body = Buffer.isBuffer(fileContent) || fileContent instanceof Uint8Array 
        ? fileContent 
        : fs.createReadStream(fileContent);

    // Adding extension
    if (!filePath.endsWith('.pdf')) {
        filePath += '.pdf';
    }

    // s3 parameters
    const uploadParams = {
        Bucket: s3Config.bucketName,
        Key: filePath,
        Body: body,  // Buffer/Uint8Array or Stream
        ContentType: 'application/pdf'
    };

    try {
        // Uploading to S3
        const command = new PutObjectCommand(uploadParams);
        await client.send(command);
        console.log(`PDF subido a: ${filePath}`);

        return isPrivate ? "URL privada requerida" : getPublicUrl(filePath);

    } catch (error) {
        console.error('Error al subir a S3:', error);
        throw new Error('Error al subir archivo a S3');
    }

};


/**
 * Get a file from S3
 * @param {*} filePath 
 * @returns 
 */
const getFileFromS3 = async (filePath) => {
    console.log('filePath', filePath);
    const params = {
        Bucket: s3Config.bucketName,
        Key: filePath,
    };

    const command = new GetObjectCommand(params);
    const result = await client.send(command);
    const url = getPublicUrl(filePath);

    return {
        metadata: result.$metadata,
        url
    };
}

/**
 * Get all files from a bucket in S3
 * @returns {Array} files
 */
const getFilesFromS3 = async () => {
    const params = {
        Bucket: s3Config.bucketName
    };

    const command = new ListObjectsCommand(params);
    const result = await client.send(command);
    return result;
}

/**
 * Generate a presigned URL for a file in S3
 * @param {*} fileName 
 * @returns 
 */
const generatePresignedUrl = async (folderName, fileName) => {
    const filePath = `${folderName}/${fileName}`;
    const command = new GetObjectCommand({
        Bucket: s3Config.bucketName,
        Key: filePath,
    })
    return await getSignedUrl(client, command, { expiresIn: 3600 })
}

module.exports = {
    uploadFileToS3,
    getFileFromS3,
    getFilesFromS3,
    generatePresignedUrl,
    getPublicUrl,
};