const s3Config = require('../config/s3.config.js');
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
const uploadFileToS3 = async (filePath, file, isPrivate) => {

    const stream = fs.createReadStream(file.tempFilePath);

    // Obtener la extensión del archivo original
    const originalExt = path.extname(file.name || '');

    // Agregarla si no está presente en el filePath
    if (!path.extname(filePath) && originalExt) {
        filePath += originalExt;
    }

    const uploadParams = {
        Bucket: s3Config.bucketName,
        Key: filePath,
        Body: stream
    };

    const command = new PutObjectCommand(uploadParams); 
    await client.send(command);
    console.log('File uploaded successfully');

    if (isPrivate === 'true') {
        return "Solo se podrá acceder a este archivo mediante una URL prefirmada.";
    }

    return getPublicUrl(filePath);
}


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