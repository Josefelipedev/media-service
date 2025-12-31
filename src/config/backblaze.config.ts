import { registerAs } from '@nestjs/config';

export default registerAs('backblaze', () => ({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  bucketId: process.env.B2_BUCKET_ID,
  bucketName: process.env.B2_BUCKET_NAME,
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION || 'us-west-002',
  signedUrlExpiration: parseInt(
    process.env.B2_SIGNED_URL_EXPIRATION || '3600',
    10,
  ),
}));
