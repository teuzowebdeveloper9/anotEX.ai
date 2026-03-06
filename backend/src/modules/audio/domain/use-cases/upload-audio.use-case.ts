import { Inject, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { AudioEntity } from '../entities/audio.entity.js';
import { CreateAudioProps } from '../entities/audio.entity.js';
import type { IAudioRepository } from '../repositories/audio.repository.js';
import { AUDIO_REPOSITORY } from '../repositories/audio.repository.js';
import type { IStorageRepository } from '../repositories/storage.repository.js';
import { STORAGE_REPOSITORY } from '../repositories/storage.repository.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

const ALLOWED_MIME_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];

export interface UploadAudioInput {
  userId: string;
  file: Express.Multer.File;
}

@Injectable()
export class UploadAudioUseCase {
  private readonly logger = new Logger(UploadAudioUseCase.name);

  constructor(
    @Inject(AUDIO_REPOSITORY) private readonly audioRepository: IAudioRepository,
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: IStorageRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: UploadAudioInput): Promise<Result<AudioEntity>> {
    const maxSizeMb = this.configService.get<number>('MAX_AUDIO_SIZE_MB', 100);
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    this.logger.log(`Upload iniciado | userId=${input.userId} | file=${input.file.originalname} | size=${input.file.size}B | mime=${input.file.mimetype}`);

    if (!ALLOWED_MIME_TYPES.includes(input.file.mimetype)) {
      this.logger.warn(`MIME type não permitido: ${input.file.mimetype}`);
      return fail(new BadRequestException(`Unsupported audio format: ${input.file.mimetype}`));
    }

    if (input.file.size > maxSizeBytes) {
      this.logger.warn(`Arquivo excede limite: ${input.file.size}B > ${maxSizeBytes}B`);
      return fail(new BadRequestException(`File exceeds maximum size of ${maxSizeMb}MB`));
    }

    const sanitizedName = input.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `audios/${input.userId}/${randomUUID()}-${sanitizedName}`;

    this.logger.log(`Enviando para R2 | key=${storageKey}`);
    try {
      await this.storageRepository.upload(storageKey, input.file.buffer, input.file.mimetype);
    } catch (err) {
      this.logger.error(`Falha no upload para R2 | key=${storageKey}`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
    this.logger.log(`Upload R2 concluído | key=${storageKey}`);

    const props: CreateAudioProps = {
      userId: input.userId,
      fileName: sanitizedName,
      mimeType: input.file.mimetype,
      sizeBytes: input.file.size,
      storageKey,
    };

    const audio = await this.audioRepository.create(props);
    this.logger.log(`Audio criado no banco | audioId=${audio.id}`);
    return ok(audio);
  }
}
