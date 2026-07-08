import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { ShareLinkEntity, ResourceType } from '../entities/share-link.entity.js';
import { SHARE_LINK_REPOSITORY, type IShareLinkRepository } from '../repositories/share-link.repository.js';
import { AUDIO_REPOSITORY, type IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import { TRANSCRIPTION_REPOSITORY, type ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { STUDY_MATERIAL_REPOSITORY, type IStudyMaterialRepository } from '../../../study-materials/domain/repositories/study-material.repository.js';
import { STUDY_FOLDER_REPOSITORY, type IStudyFolderRepository } from '../../../study-folders/domain/repositories/study-folder.repository.js';

export interface CreateShareLinkInput {
  readonly userId: string;
  readonly resourceType: ResourceType;
  readonly resourceId: string;
}

@Injectable()
export class CreateShareLinkUseCase {
  constructor(
    @Inject(SHARE_LINK_REPOSITORY)
    private readonly shareLinkRepository: IShareLinkRepository,
    @Inject(AUDIO_REPOSITORY)
    private readonly audioRepository: IAudioRepository,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
    @Inject(STUDY_MATERIAL_REPOSITORY)
    private readonly studyMaterialRepository: IStudyMaterialRepository,
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly studyFolderRepository: IStudyFolderRepository,
  ) {}

  async execute(input: CreateShareLinkInput): Promise<Result<ShareLinkEntity>> {
    // SEGURANÇA (BOLA/IDOR): só o dono do recurso pode gerar um link de compartilhamento.
    // Sem esta checagem, um usuário criava link para o UUID de um recurso alheio,
    // virava "dono" do link e expunha o conteúdo da vítima via a rota pública.
    const owns = await this.userOwnsResource(input.userId, input.resourceType, input.resourceId);
    if (!owns) {
      return fail(new ForbiddenException('Você não tem acesso a este recurso'));
    }

    const shareLink = await this.shareLinkRepository.findOrCreate({
      ownerId: input.userId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
    });
    return ok(shareLink);
  }

  private async userOwnsResource(
    userId: string,
    resourceType: ResourceType,
    resourceId: string,
  ): Promise<boolean> {
    switch (resourceType) {
      case 'transcription':
      case 'audio': {
        // Para 'transcription' o resourceId é o id do áudio (mesma view compartilhada)
        const audio = await this.audioRepository.findById(resourceId);
        if (audio) return audio.userId === userId;
        const transcription = await this.transcriptionRepository.findById(resourceId);
        return transcription?.userId === userId;
      }
      case 'study_material': {
        const material = await this.studyMaterialRepository.findById(resourceId);
        return material?.userId === userId;
      }
      case 'study_folder': {
        const folder = await this.studyFolderRepository.findById(resourceId);
        return folder?.userId === userId;
      }
      default:
        return false;
    }
  }
}
