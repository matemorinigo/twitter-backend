import 'dotenvrc'
import { S3Client } from '@aws-sdk/client-s3'
import * as process from 'process'

export default new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID : '',
    secretAccessKey: process.env.AWS_SECRET_KEY ? process.env.AWS_SECRET_KEY : ''
  }
})
