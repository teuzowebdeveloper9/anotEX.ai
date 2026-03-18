import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Body,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bull';
import { Throttle } from '@nestjs/throttler';
import type { Queue } from 'bull';
import type { AuthenticatedRequest } from '../guards/auth.guard.js';
import { UserUploadThrottlerGuard } from '../guards/user-upload-throttler.guard.js';
import { UploadAudioUseCase } from '../../domain/use-cases/upload-audio.use-case.js';
import { GetAudioStatusUseCase } from '../../domain/use-cases/get-audio-status.use-case.js';
import type { IAudioRepository } from '../../domain/repositories/audio.repository.js';
import { AUDIO_REPOSITORY } from '../../domain/repositories/audio.repository.js';
import type { IStorageRepository } from '../../domain/repositories/storage.repository.js';
import { STORAGE_REPOSITORY } from '../../domain/repositories/storage.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';
import { UploadAudioDto } from '../../application/dto/upload-audio.dto.js';
import {
  TRANSCRIPTION_QUEUE,
  PROCESS_TRANSCRIPTION_JOB,
} from '../../../transcription/application/services/transcription-queue.processor.js';
import type { TranscriptionJobData } from '../../../transcription/application/services/transcription-queue.processor.js';

@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);

  constructor(
    private readonly uploadAudioUseCase: UploadAudioUseCase,
    private readonly getAudioStatusUseCase: GetAudioStatusUseCase,
    @Inject(AUDIO_REPOSITORY) private readonly audioRepository: IAudioRepository,
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: IStorageRepository,
    @Inject(TRANSCRIPTION_REPOSITORY) private readonly transcriptionRepository: ITranscriptionRepository,
    @InjectQueue(TRANSCRIPTION_QUEUE) private readonly transcriptionQueue: Queue<TranscriptionJobData>,
  ) {}

  // 10 uploads por hora por usuário autenticado
  @UseGuards(UserUploadThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('audio'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAudioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) throw new BadRequestException('Audio file is required');

    const result = await this.uploadAudioUseCase.execute({
      userId: req.user.id,
      file,
    });

    if (!result.success) throw result.error;

    const transcription = await this.transcriptionRepository.create({
      audioId: result.data.id,
      userId: req.user.id,
      language: dto.language ?? 'pt',
    });

    await this.transcriptionQueue.add(
      PROCESS_TRANSCRIPTION_JOB,
      { transcriptionId: transcription.id, audioId: result.data.id, userId: req.user.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
    );

    return {
      audioId: result.data.id,
      transcriptionId: transcription.id,
      status: result.data.status,
      fileName: result.data.fileName,
      createdAt: result.data.createdAt,
    };
  }

  @Get(':id/url')
  async getSignedUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.getAudioStatusUseCase.execute({ audioId: id, userId: req.user.id });
    if (!result.success) throw result.error;
    const url = await this.storageRepository.getSignedUrl(result.data.storageKey, 900);
    return { url };
  }

  @Get(':id/status')
  async getStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const audioResult = await this.getAudioStatusUseCase.execute({
      audioId: id,
      userId: req.user.id,
    });

    if (!audioResult.success) throw audioResult.error;

    const transcription = await this.transcriptionRepository.findByAudioId(id);

    return {
      audio: {
        id: audioResult.data.id,
        status: audioResult.data.status,
        fileName: audioResult.data.fileName,
      },
      transcription: transcription
        ? {
            id: transcription.id,
            status: transcription.status,
            title: transcription.title,
            transcriptionText: transcription.transcriptionText,
            summaryText: transcription.summaryText,
            segments: transcription.segments ?? null,
            errorMessage: transcription.errorMessage,
          }
        : null,
    };
  }

  @Get()
  async listMyAudios(@Req() req: AuthenticatedRequest) {
    const audios = await this.audioRepository.findByUserId(req.user.id);
    return audios.map((audio) => ({
      id: audio.id,
      status: audio.status,
      fileName: audio.fileName,
      sizeBytes: audio.sizeBytes,
      createdAt: audio.createdAt,
    }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.getAudioStatusUseCase.execute({
      audioId: id,
      userId: req.user.id,
    });

    if (!result.success) throw result.error;

    const { storageKey } = result.data;

    // Deleta transcrição e áudio do banco primeiro
    await this.transcriptionRepository.deleteByAudioId(id);
    await this.audioRepository.delete(id);

    // Deleta do R2 por último — se falhar, o registro já foi removido
    // e o arquivo fica órfão (privado, inacessível sem signed URL)
    try {
      await this.storageRepository.delete(storageKey);
    } catch (err) {
      this.logger.error(
        `Falha ao deletar arquivo do R2 | key=${storageKey}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
