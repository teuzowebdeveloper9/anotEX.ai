export interface IStorageRepository {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export const STORAGE_REPOSITORY = Symbol('IStorageRepository');
