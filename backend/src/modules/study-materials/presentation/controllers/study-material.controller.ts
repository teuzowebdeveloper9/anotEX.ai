import {
  Controller,
  Get,
  Param,
  Req,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { GetStudyMaterialsUseCase } from '../../domain/use-cases/get-study-materials.use-case.js';
import { StudyMaterialType } from '../../domain/entities/study-material.entity.js';
import type { StudyMaterialEntity } from '../../domain/entities/study-material.entity.js';

const VALID_TYPES: StudyMaterialType[] = [StudyMaterialType.FLASHCARDS, StudyMaterialType.MINDMAP, StudyMaterialType.QUIZ];

function toResponse(m: StudyMaterialEntity) {
  return {
    id: m.id,
    type: m.type,
    status: m.status,
    content: m.content,
    errorMessage: m.errorMessage,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

@Controller('study-materials')
export class StudyMaterialController {
  constructor(private readonly getStudyMaterialsUseCase: GetStudyMaterialsUseCase) {}

  @Get(':transcriptionId')
  async listByTranscription(
    @Param('transcriptionId', ParseUUIDPipe) transcriptionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.getStudyMaterialsUseCase.execute({
      transcriptionId,
      userId: req.user.id,
    });

    if (!result.success) throw result.error;

    const materials = Array.isArray(result.data) ? result.data : [result.data];
    return materials.filter((m): m is StudyMaterialEntity => m !== null).map(toResponse);
  }

  @Get(':transcriptionId/:type')
  async getByType(
    @Param('transcriptionId', ParseUUIDPipe) transcriptionId: string,
    @Param('type') type: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!VALID_TYPES.includes(type as StudyMaterialType)) {
      throw new BadRequestException(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    const result = await this.getStudyMaterialsUseCase.execute({
      transcriptionId,
      userId: req.user.id,
      type: type as StudyMaterialType,
    });






    

    if (!result.success) throw result.error;

    if (!result.data) throw new NotFoundException(`Study material of type '${type}' not found`);

    return toResponse(result.data as StudyMaterialEntity);
  }
}
