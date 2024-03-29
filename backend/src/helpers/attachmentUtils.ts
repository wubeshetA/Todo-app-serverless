import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

var AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)


/**
 * AttachmentUtils class contains all the functions that interact
 * with the S3 bucket. It contains the following functions:
 *    - getAttachmentUrl
 *    - getUploadUrl
 *  The class is exported so that it can be used in the businessLogic.
 */

const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
// const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const urlExpiration = 300

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = s3BucketName
     ) {}

getAttachmentUrl(todoId: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
}

// Get signed url for uploading attachment
getUploadUrl(todoId: string): string {
    console.log("getUploadUrl called")
    const url = this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: todoId,
        Expires: urlExpiration
    })
    console.log("getUploadUrl url : = : ", url)
    return url as string
}  
}