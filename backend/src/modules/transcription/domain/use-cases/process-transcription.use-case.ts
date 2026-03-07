import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ITranscriptionRepository } from '../repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../repositories/transcription.repository.js';
import type { ITranscriptionProvider, ISummaryProvider } from '../repositories/transcription.provider.js';
import { TRANSCRIPTION_PROVIDER, SUMMARY_PROVIDER } from '../repositories/transcription.provider.js';
import type { IStorageRepository } from '../../../audio/domain/repositories/storage.repository.js';
import { STORAGE_REPOSITORY } from '../../../audio/domain/repositories/storage.repository.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import { AUDIO_REPOSITORY } from '../../../audio/domain/repositories/audio.repository.js';
import { AudioStatus } from '../../../audio/domain/entities/audio.entity.js';
import { TranscriptionStatus } from '../entities/transcription.entity.js';

export interface ProcessTranscriptionInput {
  transcriptionId: string;
  audioId: string;
}

@Injectable()
export class ProcessTranscriptionUseCase {
  private readonly logger = new Logger(ProcessTranscriptionUseCase.name);

  constructor(
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
    @Inject(AUDIO_REPOSITORY)
    private readonly audioRepository: IAudioRepository,
    @Inject(STORAGE_REPOSITORY)
    private readonly storageRepository: IStorageRepository,
    @Inject(TRANSCRIPTION_PROVIDER)
    private readonly transcriptionProvider: ITranscriptionProvider,
    @Inject(SUMMARY_PROVIDER)
    private readonly summaryProvider: ISummaryProvider,
  ) {}

  async execute(input: ProcessTranscriptionInput): Promise<void> {
    const transcription = await this.transcriptionRepository.findById(input.transcriptionId);
    if (!transcription) {
      this.logger.error(`Transcription ${input.transcriptionId} not found`);
      return;
    }

    const audio = await this.audioRepository.findById(input.audioId);
    if (!audio) {
      await this.transcriptionRepository.updateStatus(
        input.transcriptionId,
        TranscriptionStatus.FAILED,
        'Audio not found',
      );
      return;
    }

    try {
      await this.transcriptionRepository.updateStatus(
        input.transcriptionId,
        TranscriptionStatus.PROCESSING,
      );
      await this.audioRepository.updateStatus(input.audioId, AudioStatus.PROCESSING);

      const signedUrl = await this.storageRepository.getSignedUrl(audio.storageKey, 300);
      const response = await fetch(signedUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      const transcriptionText = await this.transcriptionProvider.transcribe(
        buffer,
        transcription.language,
      );

      const [summaryText, title] = await Promise.all([
        this.summaryProvider.summarize(transcriptionText),
        this.summaryProvider.generateTitle(transcriptionText),
      ]);

      await this.transcriptionRepository.updateResult(
        input.transcriptionId,
        transcriptionText,
        summaryText,
        title,
      );
      await this.transcriptionRepository.updateStatus(
        input.transcriptionId,
        TranscriptionStatus.COMPLETED,
      );
      await this.audioRepository.updateStatus(input.audioId, AudioStatus.COMPLETED);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process transcription ${input.transcriptionId}: ${message}`);

      await this.transcriptionRepository.updateStatus(
        input.transcriptionId,
        TranscriptionStatus.FAILED,
        message,
      );
      await this.audioRepository.updateStatus(input.audioId, AudioStatus.FAILED, message);
    }
  }
}
