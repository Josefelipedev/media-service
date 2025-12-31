export interface BackblazeConfig {
  accountId: string;
  applicationKey: string;
  bucketName: string;
  endpoint: string;
  region: string;
  signedUrlExpiration: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  downloadUrl: string;
  expiresAt: Date;
}
