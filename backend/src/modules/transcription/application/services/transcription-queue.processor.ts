import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { ProcessTranscriptionUseCase } from '../../domain/use-cases/process-transcription.use-case.js';

export const TRANSCRIPTION_QUEUE = 'transcription';
export const PROCESS_TRANSCRIPTION_JOB = 'process';

export interface TranscriptionJobData {
  transcriptionId: string;
  audioId: string;
}

@Processor(TRANSCRIPTION_QUEUE)
export class TranscriptionQueueProcessor {
  private readonly logger = new Logger(TranscriptionQueueProcessor.name);

  constructor(
    private readonly processTranscriptionUseCase: ProcessTranscriptionUseCase,
  ) {}

  @Process(PROCESS_TRANSCRIPTION_JOB)
  async handleProcess(job: Job<TranscriptionJobData>): Promise<void> {
    this.logger.log(`Processing job ${job.id} for audio ${job.data.audioId}`);

    await this.processTranscriptionUseCase.execute({
      transcriptionId: job.data.transcriptionId,
      audioId: job.data.audioId,
    });
  }
}
