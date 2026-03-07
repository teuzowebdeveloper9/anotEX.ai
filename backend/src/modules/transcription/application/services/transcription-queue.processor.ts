import { Processor, Process } from '@nestjs/bull';
import { InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job, Queue } from 'bull';
import { ProcessTranscriptionUseCase } from '../../domain/use-cases/process-transcription.use-case.js';
import {
  STUDY_MATERIAL_QUEUE,
  GENERATE_STUDY_MATERIALS_JOB,
} from '../../../study-materials/application/services/study-material-queue.processor.js';
import type { StudyMaterialJobData } from '../../../study-materials/application/services/study-material-queue.processor.js';

export const TRANSCRIPTION_QUEUE = 'transcription';
export const PROCESS_TRANSCRIPTION_JOB = 'process';

export interface TranscriptionJobData {
  transcriptionId: string;
  audioId: string;
  userId: string;
}

@Processor(TRANSCRIPTION_QUEUE)
export class TranscriptionQueueProcessor {
  private readonly logger = new Logger(TranscriptionQueueProcessor.name);

  constructor(
    private readonly processTranscriptionUseCase: ProcessTranscriptionUseCase,
    @InjectQueue(STUDY_MATERIAL_QUEUE)
    private readonly studyMaterialQueue: Queue<StudyMaterialJobData>,
  ) {}

  @Process(PROCESS_TRANSCRIPTION_JOB)
  async handleProcess(job: Job<TranscriptionJobData>): Promise<void> {
    this.logger.log(`Processing job ${job.id} for audio ${job.data.audioId}`);

    const succeeded = await this.processTranscriptionUseCase.execute({
      transcriptionId: job.data.transcriptionId,
      audioId: job.data.audioId,
    });

    if (!succeeded) {
      this.logger.warn(`Transcription failed — skipping study materials | transcriptionId=${job.data.transcriptionId}`);
      return;
    }

    // Após transcrição concluída com sucesso, enfileira geração de materiais de estudo
    await this.studyMaterialQueue.add(
      GENERATE_STUDY_MATERIALS_JOB,
      { transcriptionId: job.data.transcriptionId, userId: job.data.userId },
      { attempts: 2, backoff: { type: 'exponential', delay: 10000 }, removeOnComplete: true },
    );

    this.logger.log(`Study materials job enqueued | transcriptionId=${job.data.transcriptionId}`);
  }
}
