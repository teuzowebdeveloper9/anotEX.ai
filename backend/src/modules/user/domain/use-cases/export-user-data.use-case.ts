import { Injectable, Inject } from '@nestjs/common';
import { AUDIO_REPOSITORY } from '../../../audio/domain/repositories/audio.repository.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';

export interface UserDataExport {
  exportedAt: string;
  userId: string;
  audios: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    status: string;
    createdAt: Date;
  }>;
  transcriptions: Array<{
    id: string;
    audioId: string;
    status: string;
    title: string | null;
    transcriptionText: string | null;
    summaryText: string | null;
    language: string;
    createdAt: Date;
  }>;
}

@Injectable()
export class ExportUserDataUseCase {
  constructor(
    @Inject(AUDIO_REPOSITORY) private readonly audioRepository: IAudioRepository,
    @Inject(TRANSCRIPTION_REPOSITORY) private readonly transcriptionRepository: ITranscriptionRepository,
  ) {}

  async execute(userId: string): Promise<UserDataExport> {
    const [audios, transcriptions] = await Promise.all([
      this.audioRepository.findByUserId(userId),
      this.transcriptionRepository.findByUserId(userId),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      userId,
      audios: audios.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        status: a.status,
        createdAt: a.createdAt,
      })),
      transcriptions: transcriptions.map((t) => ({
        id: t.id,
        audioId: t.audioId,
        status: t.status,
        title: t.title,
        transcriptionText: t.transcriptionText,
        summaryText: t.summaryText,
        language: t.language,
        createdAt: t.createdAt,
      })),
    };
  }
}
