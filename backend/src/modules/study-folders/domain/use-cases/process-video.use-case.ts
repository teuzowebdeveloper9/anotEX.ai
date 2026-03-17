import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { readFile, unlink } from 'fs/promises';
import type { Queue } from 'bull';
import YTDlpWrap from 'yt-dlp-wrap';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import { AUDIO_REPOSITORY } from '../../../audio/domain/repositories/audio.repository.js';
import type { IStorageRepository } from '../../../audio/domain/repositories/storage.repository.js';
import { STORAGE_REPOSITORY } from '../../../audio/domain/repositories/storage.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';
import {
  TRANSCRIPTION_QUEUE,
  PROCESS_TRANSCRIPTION_JOB,
} from '../../../transcription/application/services/transcription-queue.processor.js';
import type { TranscriptionJobData } from '../../../transcription/application/services/transcription-queue.processor.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

export interface ProcessVideoInput {
  readonly folderId: string;
  readonly userId: string;
  readonly videoId: string;
  readonly videoTitle: string;
}

export interface ProcessVideoOutput {
  readonly audioId: string;
  readonly transcriptionId: string;
}

@Injectable()
export class ProcessVideoUseCase implements OnModuleInit {
  private readonly logger = new Logger(ProcessVideoUseCase.name);
  private ytDlp!: YTDlpWrap;

  async onModuleInit(): Promise<void> {
    try {
      const ytDlp = new YTDlpWrap();
      await ytDlp.execPromise(['--version']);
      this.ytDlp = ytDlp;
      this.logger.log('yt-dlp encontrado no PATH do sistema');
    } catch {
      const binaryPath = join(process.cwd(), 'yt-dlp-binary');
      this.logger.log(`yt-dlp não encontrado no PATH — baixando binário para ${binaryPath}`);
      await YTDlpWrap.downloadFromGithub(binaryPath);
      this.ytDlp = new YTDlpWrap(binaryPath);
      this.logger.log('yt-dlp baixado com sucesso');
    }
  }

  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY) private readonly folderRepository: IStudyFolderRepository,
    @Inject(AUDIO_REPOSITORY) private readonly audioRepository: IAudioRepository,
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: IStorageRepository,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
    @InjectQueue(TRANSCRIPTION_QUEUE)
    private readonly transcriptionQueue: Queue<TranscriptionJobData>,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: ProcessVideoInput): Promise<Result<ProcessVideoOutput>> {
    const folder = await this.folderRepository.findById(input.folderId);
    if (!folder) return fail(new NotFoundException('Pasta não encontrada'));
    if (folder.userId !== input.userId) return fail(new ForbiddenException('Acesso negado'));

    const url = `https://www.youtube.com/watch?v=${input.videoId}`;
    const tmpFile = join(tmpdir(), `${randomUUID()}.webm`);

    this.logger.log(`Baixando áudio do YouTube | videoId=${input.videoId}`);
    try {
      await this.ytDlp.execPromise([
        url,
        '-f',
        'bestaudio[ext=webm]/bestaudio/best',
        '--no-playlist',
        '--max-filesize',
        '200m',
        '-o',
        tmpFile,
      ]);
    } catch (err) {
      this.logger.error(
        `Falha ao baixar vídeo | videoId=${input.videoId}`,
        err instanceof Error ? err.stack : String(err),
      );
      return fail(new BadRequestException('Não foi possível baixar o áudio do vídeo'));
    }

    let buffer: Buffer;
    try {
      buffer = await readFile(tmpFile);
    } finally {
      await unlink(tmpFile).catch(() => undefined);
    }

    const sanitizedTitle = input.videoTitle.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    const storageKey = `audios/${input.userId}/${randomUUID()}-${sanitizedTitle}.webm`;

    this.logger.log(`Enviando para R2 | key=${storageKey} | size=${buffer.length}B`);
    try {
      await this.storageRepository.upload(storageKey, buffer, 'audio/webm');
    } catch (err) {
      this.logger.error(
        `Falha no upload R2 | key=${storageKey}`,
        err instanceof Error ? err.stack : String(err),
      );
      return fail(new BadRequestException('Falha ao salvar o áudio'));
    }

    const audio = await this.audioRepository.create({
      userId: input.userId,
      fileName: `${sanitizedTitle}.webm`,
      mimeType: 'audio/webm',
      sizeBytes: buffer.length,
      storageKey,
    });
    this.logger.log(`Audio criado | audioId=${audio.id}`);

    const transcription = await this.transcriptionRepository.create({
      audioId: audio.id,
      userId: input.userId,
      language: 'pt',
    });
    this.logger.log(`Transcrição criada | transcriptionId=${transcription.id}`);

    await this.transcriptionQueue.add(
      PROCESS_TRANSCRIPTION_JOB,
      { transcriptionId: transcription.id, audioId: audio.id, userId: input.userId },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true },
    );
    this.logger.log(`Job enfileirado | transcriptionId=${transcription.id}`);

    return ok({ audioId: audio.id, transcriptionId: transcription.id });
  }
}
