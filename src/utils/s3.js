// src/utils/s3.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');
const s3Config = require('../config/s3.config');   // tu config existente

const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

/**
 * 
 * @param {Buffer|Uint8Array|Readable} fileBuffer  
 * @param {string}  originalName                   
 * @param {string}  folder                         
 */
async function uploadFileToS3(fileBuffer, originalName, folder = 'courses') {
  const ext = path.extname(originalName);
  const randomName = crypto.randomUUID() + ext;      // nombre único
  const Key = `${folder}/${randomName}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key,
    Body: fileBuffer,
    ContentType: ext === '.png' ? 'image/png' : 'image/jpeg',
    ACL: 'public-read',
  }));

  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${Key}`;
}

module.exports = { uploadFileToS3 };
