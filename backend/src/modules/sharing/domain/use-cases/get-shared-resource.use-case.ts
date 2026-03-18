import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import { SHARE_LINK_REPOSITORY, type IShareLinkRepository } from '../repositories/share-link.repository.js';
import type { ShareLinkEntity } from '../entities/share-link.entity.js';
import { AUDIO_REPOSITORY, type IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import type { AudioEntity } from '../../../audio/domain/entities/audio.entity.js';
import { TRANSCRIPTION_REPOSITORY, type ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import type { TranscriptionEntity } from '../../../transcription/domain/entities/transcription.entity.js';
import { STUDY_MATERIAL_REPOSITORY, type IStudyMaterialRepository } from '../../../study-materials/domain/repositories/study-material.repository.js';
import { StudyMaterialType, type StudyMaterialEntity } from '../../../study-materials/domain/entities/study-material.entity.js';

export interface SharedResourceData {
  readonly shareLink: Pick<ShareLinkEntity, 'token' | 'resourceType' | 'resourceId'>;
  readonly audio: Pick<AudioEntity, 'id' | 'status' | 'fileName'> | null;
  readonly transcription: Pick<
    TranscriptionEntity,
    'id' | 'title' | 'transcriptionText' | 'summaryText' | 'status' | 'errorMessage'
  > | null;
  readonly studyMaterials: {
    readonly mindmap: StudyMaterialEntity | null;
    readonly flashcards: StudyMaterialEntity | null;
  };
}

@Injectable()
export class GetSharedResourceUseCase {
  constructor(
    @Inject(SHARE_LINK_REPOSITORY)
    private readonly shareLinkRepository: IShareLinkRepository,
    @Inject(AUDIO_REPOSITORY)
    private readonly audioRepository: IAudioRepository,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
    @Inject(STUDY_MATERIAL_REPOSITORY)
    private readonly studyMaterialRepository: IStudyMaterialRepository,
  ) {}

  async execute(token: string): Promise<Result<SharedResourceData>> {
    const shareLink = await this.shareLinkRepository.findByToken(token);

    if (!shareLink) {
      return fail(new NotFoundException('Share link not found'));
    }

    if (!shareLink.isPublic) {
      return fail(new ForbiddenException('This resource is not public'));
    }

    if (shareLink.resourceType !== 'transcription') {
      return fail(new BadRequestException('Unsupported resource type'));
    }

    const audioId = shareLink.resourceId;
    const audio = await this.audioRepository.findById(audioId);

    if (!audio) {
      return fail(new NotFoundException('Resource not found'));
    }

    const transcription = await this.transcriptionRepository.findByAudioId(audioId);

    let mindmap: StudyMaterialEntity | null = null;
    let flashcards: StudyMaterialEntity | null = null;

    if (transcription?.id && transcription.status === 'COMPLETED') {
      [mindmap, flashcards] = await Promise.all([
        this.studyMaterialRepository.findByTranscriptionIdAndType(transcription.id, StudyMaterialType.MINDMAP),
        this.studyMaterialRepository.findByTranscriptionIdAndType(transcription.id, StudyMaterialType.FLASHCARDS),
      ]);
    }

    return ok({
      shareLink: {
        token: shareLink.token,
        resourceType: shareLink.resourceType,
        resourceId: shareLink.resourceId,
      },
      audio: { id: audio.id, status: audio.status, fileName: audio.fileName },
      transcription: transcription
        ? {
            id: transcription.id,
            title: transcription.title,
            transcriptionText: transcription.transcriptionText,
            summaryText: transcription.summaryText,
            status: transcription.status,
            errorMessage: transcription.errorMessage,
          }
        : null,
      studyMaterials: { mindmap, flashcards },
    });
  }
}
