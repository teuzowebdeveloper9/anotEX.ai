import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { IStorageRepository } from '../../domain/repositories/storage.repository.js';

@Injectable()
export class StorageRepositoryImpl implements IStorageRepository {
  private readonly logger = new Logger(StorageRepositoryImpl.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    const accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.log(`R2 inicializado | bucket=${this.bucket} | accountId=${accountId.slice(0, 8)}...`);
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    this.logger.log(`PutObject | key=${key} | size=${buffer.length}B`);
    const start = Date.now();
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );
      this.logger.log(`PutObject ok | key=${key} | ${Date.now() - start}ms`);
    } catch (err) {
      this.logger.error(`PutObject falhou | key=${key} | ${Date.now() - start}ms`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
