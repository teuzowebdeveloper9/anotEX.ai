import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { GenerateStudyMaterialsUseCase } from '../../domain/use-cases/generate-study-materials.use-case.js';

export const STUDY_MATERIAL_QUEUE = 'study-material';
export const GENERATE_STUDY_MATERIALS_JOB = 'generate';

export interface StudyMaterialJobData {
  transcriptionId: string;
  userId: string;
}

@Processor(STUDY_MATERIAL_QUEUE)
export class StudyMaterialQueueProcessor {
  private readonly logger = new Logger(StudyMaterialQueueProcessor.name);

  constructor(
    private readonly generateStudyMaterialsUseCase: GenerateStudyMaterialsUseCase,
  ) {}

  @Process(GENERATE_STUDY_MATERIALS_JOB)
  async handleGenerate(job: Job<StudyMaterialJobData>): Promise<void> {
    this.logger.log(`Gerando materiais de estudo | transcriptionId=${job.data.transcriptionId}`);
    await this.generateStudyMaterialsUseCase.execute(job.data);
  }
}
