import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage.interface';
import { Readable } from 'node:stream';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class BackblazeService implements StorageService {
  private readonly logger = new Logger(BackblazeService.name);
  private readonly accountId: string;
  private readonly applicationKey: string;
  private readonly bucketName: string;
  private readonly bucketId: string;
  private readonly applicationKeyId: string;
  private readonly apiUrl = 'https://api.backblazeb2.com/b2api/v2';

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get('backblaze.accountId')!;
    this.applicationKey = this.configService.get('backblaze.applicationKey')!;
    this.bucketName = this.configService.get('backblaze.bucketName')!;
    this.bucketId = this.configService.get('backblaze.bucketId')!;
    this.applicationKeyId = this.configService.get(
      'backblaze.applicationKeyId',
    )!;

    // Log para diagnóstico (cuidado com credenciais em produção)
    this.logger.debug(`Backblaze Config Loaded: 
      Account ID: ${this.accountId ? 'Present' : 'Missing'}
      Application Key: ${this.applicationKey ? 'Present' : 'Missing'}
      Bucket Name: ${this.bucketName}
      Bucket ID: ${this.bucketId}`);

    if (
      !this.applicationKeyId ||
      !this.applicationKey ||
      !this.bucketName ||
      !this.bucketId
    ) {
      const missing: string[] = [];

      if (!this.applicationKeyId) missing.push('applicationKeyId');
      if (!this.applicationKey) missing.push('applicationKey');
      if (!this.bucketName) missing.push('bucketName');
      if (!this.bucketId) missing.push('bucketId');

      this.logger.error(
        `Backblaze credentials not configured. Missing: ${missing.join(', ')}`,
      );

      throw new Error('Backblaze credentials not configured');
    }
  }

  // Método auxiliar para autenticar e obter token
  private async authorizeAccount(): Promise<{
    authorizationToken: string;
    apiUrl: string;
    downloadUrl: string;
  }> {
    const authString = Buffer.from(
      `${this.applicationKeyId}:${this.applicationKey}`,
    ).toString('base64');

    try {
      const response = await axios.get(
        'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
        {
          headers: {
            Authorization: `Basic ${authString}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to authorize: ${error.message}`);
    }
  }

  // Obter URL de upload
  private async getUploadUrl(): Promise<{
    uploadUrl: string;
    authorizationToken: string;
  }> {
    try {
      const auth = await this.authorizeAccount();

      const response = await axios.post(
        `${auth.apiUrl}/b2api/v2/b2_get_upload_url`,
        {
          bucketId: this.bucketId,
        },
        {
          headers: {
            Authorization: auth.authorizationToken,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.debug('Upload URL obtained successfully');
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get upload URL: ${error.message}`);
      throw new Error(`Failed to get upload URL: ${error.message}`);
    }
  }

  // Codificar nome do arquivo para URL
  private encodeFileName(fileName: string): string {
    // Remove espaços extras e codifica
    const cleanName = fileName.trim();
    return encodeURIComponent(cleanName);
  }

  // Calcular SHA1
  private calculateSha1(content: Buffer): string {
    return crypto.createHash('sha1').update(content).digest('hex');
  }

  async uploadFileDirectly(
    key: string,
    file: Buffer | Readable | ReadableStream | Uint8Array,
    contentType: string,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Starting upload for key: ${key}, type: ${contentType}`,
      );

      // Converter para Buffer
      let content: Buffer;
      if (Buffer.isBuffer(file)) {
        content = file;
      } else if (file instanceof Readable) {
        content = await this.streamToBuffer(file);
      } else if (file instanceof Uint8Array) {
        content = Buffer.from(file);
      } else if (file instanceof ReadableStream) {
        content = await this.readableStreamToBuffer(file);
      } else {
        throw new Error(`Unsupported file type: ${typeof file}`);
      }

      this.logger.debug(`File size: ${content.length} bytes`);
      this.logger.debug(`SHA1: ${this.calculateSha1(content)}`);

      // Obter URL de upload
      const { uploadUrl, authorizationToken } = await this.getUploadUrl();

      // Preparar headers
      const headers: Record<string, string> = {
        Authorization: authorizationToken,
        'X-Bz-File-Name': this.encodeFileName(key),
        'Content-Type': contentType || 'application/octet-stream',
        'X-Bz-Content-Sha1': this.calculateSha1(content),
        'Content-Length': content.length.toString(),
      };

      this.logger.debug(`Upload URL: ${uploadUrl}`);
      this.logger.debug(`Headers: ${JSON.stringify(headers, null, 2)}`);

      // Fazer upload com axios
      const response = await axios.post(uploadUrl, content, {
        headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000, // 30 segundos
      });

      this.logger.log(`File uploaded successfully: ${response.data.fileId}`);
      this.logger.debug(
        `Upload response: ${JSON.stringify(response.data, null, 2)}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to upload file: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(
          `Response data: ${JSON.stringify(error.response.data)}`,
        );
      }

      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  // Helper para converter Readable stream para Buffer
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  // Helper para converter ReadableStream para Buffer
  private async readableStreamToBuffer(
    stream: ReadableStream,
  ): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    return Buffer.concat(chunks);
  }

  async generatePresignedUrl(
    key: string,
    fileType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    throw new Error('Presigned URLs require S3 Compatible API');
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const auth = await this.authorizeAccount();

      // Primeiro, obter o fileId
      const listResponse = await axios.post(
        `${auth.apiUrl}/b2api/v2/b2_list_file_names`,
        {
          bucketId: this.bucketId,
          startFileName: key,
          maxFileCount: 1,
        },
        {
          headers: {
            Authorization: auth.authorizationToken,
            'Content-Type': 'application/json',
          },
        },
      );

      const listResult = listResponse.data;
      const file = listResult.files.find((f: any) => f.fileName === key);

      if (!file) {
        throw new Error(`File not found: ${key}`);
      }

      // Deletar o arquivo
      await axios.post(
        `${auth.apiUrl}/b2api/v2/b2_delete_file_version`,
        {
          fileId: file.fileId,
          fileName: key,
        },
        {
          headers: {
            Authorization: auth.authorizationToken,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  async getFileUrl(key: string): Promise<string> {
    const auth = await this.authorizeAccount();

    return `${auth.downloadUrl}/file/${this.bucketName}/${encodeURIComponent(
      key,
    )}`;
  }
}
