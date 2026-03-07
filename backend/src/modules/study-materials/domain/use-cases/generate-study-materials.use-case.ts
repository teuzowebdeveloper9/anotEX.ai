import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IStudyMaterialRepository } from '../repositories/study-material.repository.js';
import { STUDY_MATERIAL_REPOSITORY } from '../repositories/study-material.repository.js';
import type { IStudyMaterialProvider } from '../repositories/study-material.provider.js';
import { STUDY_MATERIAL_PROVIDER } from '../repositories/study-material.provider.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';
import {
  StudyMaterialStatus,
  StudyMaterialType,
} from '../entities/study-material.entity.js';

export interface GenerateStudyMaterialsInput {
  transcriptionId: string;
  userId: string;
}

@Injectable()
export class GenerateStudyMaterialsUseCase {
  private readonly logger = new Logger(GenerateStudyMaterialsUseCase.name);

  constructor(
    @Inject(STUDY_MATERIAL_REPOSITORY)
    private readonly studyMaterialRepository: IStudyMaterialRepository,
    @Inject(STUDY_MATERIAL_PROVIDER)
    private readonly studyMaterialProvider: IStudyMaterialProvider,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
  ) {}

  async execute(input: GenerateStudyMaterialsInput): Promise<void> {
    const transcription = await this.transcriptionRepository.findById(input.transcriptionId);

    if (!transcription || !transcription.summaryText) {
      this.logger.warn(
        `Transcription ${input.transcriptionId} not found or has no summary — skipping study materials`,
      );
      return;
    }

    const types: StudyMaterialType[] = [
      StudyMaterialType.FLASHCARDS,
      StudyMaterialType.MINDMAP,
      StudyMaterialType.QUIZ,
    ];

    // Idempotência: pula tipos que já existem e não falharam
    const existing = await this.studyMaterialRepository.findByTranscriptionId(
      input.transcriptionId,
    );
    const existingTypes = new Set(
      existing.filter((m) => m.status !== StudyMaterialStatus.FAILED).map((m) => m.type),
    );
    const typesToCreate = types.filter((t) => !existingTypes.has(t));

    if (typesToCreate.length === 0) {
      this.logger.log(`Study materials already exist for transcription ${input.transcriptionId} — skipping`);
      return;
    }

    // Cria apenas os tipos que faltam em PENDING
    const records = await Promise.all(
      typesToCreate.map((type) =>
        this.studyMaterialRepository.create({
          transcriptionId: input.transcriptionId,
          userId: input.userId,
          type,
        }),
      ),
    );

    // Gera todos em paralelo — falha de um não afeta os outros
    await Promise.allSettled(
      records.map((record) => this.generateOne(record.id, record.type, transcription.summaryText!)),
    );
  }

  private async generateOne(
    id: string,
    type: StudyMaterialType,
    summaryText: string,
  ): Promise<void> {
    await this.studyMaterialRepository.updateStatus(id, StudyMaterialStatus.PROCESSING);

    try {
      let content;

      if (type === StudyMaterialType.FLASHCARDS) {
        content = await this.studyMaterialProvider.generateFlashcards(summaryText);
      } else if (type === StudyMaterialType.MINDMAP) {
        content = await this.studyMaterialProvider.generateMindmap(summaryText);
      } else {
        content = await this.studyMaterialProvider.generateQuiz(summaryText);
      }

      await this.studyMaterialRepository.updateContent(id, content);
      await this.studyMaterialRepository.updateStatus(id, StudyMaterialStatus.COMPLETED);
      this.logger.log(`${type} gerado | id=${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Falha ao gerar ${type} | id=${id}: ${message}`);
      // Deleta o registro para permitir nova tentativa automática no próximo request
      await this.studyMaterialRepository.deleteById(id).catch(() => undefined);
    }
  }
}

