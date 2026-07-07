import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  ContainerClient,
} from '@azure/storage-blob';
import { IStorageRepository } from '../../domain/repositories/storage.repository.js';

@Injectable()
export class AzureBlobStorageRepositoryImpl implements IStorageRepository {
  private readonly logger = new Logger(AzureBlobStorageRepositoryImpl.name);
  private readonly container: ContainerClient;
  private readonly credential: StorageSharedKeyCredential;
  private readonly containerName: string;

  constructor(private readonly configService: ConfigService) {
    const accountName = this.configService.getOrThrow<string>('AZURE_STORAGE_ACCOUNT');
    const accountKey = this.configService.getOrThrow<string>('AZURE_STORAGE_KEY');
    this.containerName = this.configService.getOrThrow<string>('AZURE_STORAGE_CONTAINER');

    this.credential = new StorageSharedKeyCredential(accountName, accountKey);
    const serviceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      this.credential,
    );
    this.container = serviceClient.getContainerClient(this.containerName);

    this.logger.log(`Azure Blob inicializado | container=${this.containerName} | account=${accountName}`);
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    this.logger.log(`UploadBlob | key=${key} | size=${buffer.length}B`);
    const start = Date.now();
    try {
      await this.container.getBlockBlobClient(key).uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: mimeType },
      });
      this.logger.log(`UploadBlob ok | key=${key} | ${Date.now() - start}ms`);
    } catch (err) {
      this.logger.error(
        `UploadBlob falhou | key=${key} | ${Date.now() - start}ms`,
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const blobClient = this.container.getBlockBlobClient(key);
    const sas = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: key,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(Date.now() - 60 * 1000),
        expiresOn: new Date(Date.now() + expiresInSeconds * 1000),
      },
      this.credential,
    ).toString();

    return `${blobClient.url}?${sas}`;
  }

  async delete(key: string): Promise<void> {
    await this.container.getBlockBlobClient(key).deleteIfExists();
  }
}
