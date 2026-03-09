import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { StudyMaterialEntity, StudyMaterialType } from '../entities/study-material.entity.js';
import type { IStudyMaterialRepository } from '../repositories/study-material.repository.js';
import { STUDY_MATERIAL_REPOSITORY } from '../repositories/study-material.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

export interface GetStudyMaterialInput {
  transcriptionId: string;
  userId: string;
  type?: StudyMaterialType;
}

@Injectable()
export class GetStudyMaterialsUseCase {
  constructor(
    @Inject(STUDY_MATERIAL_REPOSITORY)
    private readonly studyMaterialRepository: IStudyMaterialRepository,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
  ) {}

  async execute(
    input: GetStudyMaterialInput,
  ): Promise<Result<StudyMaterialEntity | StudyMaterialEntity[] | null>> {
    const transcription = await this.transcriptionRepository.findById(input.transcriptionId);

    if (!transcription) {
      return fail(new NotFoundException('Transcription not found'));
    }

    if (transcription.userId !== input.userId) {
      return fail(new ForbiddenException('Access denied'));
    }

    if (input.type) {
      const material = await this.studyMaterialRepository.findByTranscriptionIdAndType(
        input.transcriptionId,
        input.type,
      );

      // Retorna null se ainda não foi gerado (ainda em fila) — não lança 404
      return ok(material ?? null);
    }

    const materials = await this.studyMaterialRepository.findByTranscriptionId(
      input.transcriptionId,
    );

    return ok(materials);
  }
}
