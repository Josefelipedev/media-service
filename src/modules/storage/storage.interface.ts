export abstract class StorageService {
  abstract generatePresignedUrl(
    key: string,
    fileType: string,
    expiresIn?: number,
  ): Promise<string>;

  abstract deleteFile(key: string): Promise<void>;

  abstract getFileUrl(key: string): Promise<string>;

  // ADICIONE ESTE MÉTODO
  abstract uploadFileDirectly(
    key: string,
    file: Buffer | ReadableStream | Uint8Array,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<void>;
}
