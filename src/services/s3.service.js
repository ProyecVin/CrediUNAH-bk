const s3Config = require('../config/s3.config.js');
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

const client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

/**
 * Load a file to S3
 * @param {*} file 
 * @returns 
 */
const uploadFileToS3 = async (file) => {
    const stream = fs.createReadStream(file.tempFilePath);

    const uploadParams = {
        Bucket: s3Config.bucketName,
        Key: file.name,
        Body: stream
    };

    const command = new PutObjectCommand(uploadParams); 
    console.log('File uploaded successfully');
    return await client.send(command);
}

/**
 * Get a file from S3
 * @param {*} fileName 
 * @returns 
 */
const getFileFromS3 = async (fileName) => {
    const params = {
        Bucket: s3Config.bucketName,
        Key: fileName,
    };

    const command = new GetObjectCommand(params);
    return await client.send(command);
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
const generatePresignedUrl = async (fileName) => {
  const command = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: fileName
  })
  return await getSignedUrl(client, command, { expiresIn: 3600 })
}

module.exports = {
    uploadFileToS3,
    getFileFromS3,
    getFilesFromS3,
    generatePresignedUrl
};