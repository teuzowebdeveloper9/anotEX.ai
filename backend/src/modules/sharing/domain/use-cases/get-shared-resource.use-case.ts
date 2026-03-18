import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import { SHARE_LINK_REPOSITORY, type IShareLinkRepository } from '../repositories/share-link.repository.js';
import type { ShareLinkEntity } from '../entities/share-link.entity.js';
import { AUDIO_REPOSITORY, type IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import type { AudioEntity } from '../../../audio/domain/entities/audio.entity.js';
import { TRANSCRIPTION_REPOSITORY, type ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import type { TranscriptionEntity } from '../../../transcription/domain/entities/transcription.entity.js';
import { STUDY_MATERIAL_REPOSITORY, type IStudyMaterialRepository } from '../../../study-materials/domain/repositories/study-material.repository.js';
import { StudyMaterialType, type StudyMaterialEntity } from '../../../study-materials/domain/entities/study-material.entity.js';
import { STUDY_FOLDER_REPOSITORY, type IStudyFolderRepository } from '../../../study-folders/domain/repositories/study-folder.repository.js';
import type { StudyFolderEntity, StudyFolderItemEntity } from '../../../study-folders/domain/entities/study-folder.entity.js';

export interface SharedResourceData {
  readonly shareLink: Pick<ShareLinkEntity, 'token' | 'resourceType' | 'resourceId'>;
  // transcription view
  readonly audio: Pick<AudioEntity, 'id' | 'status' | 'fileName'> | null;
  readonly transcription: Pick<
    TranscriptionEntity,
    'id' | 'title' | 'transcriptionText' | 'summaryText' | 'status' | 'errorMessage'
  > | null;
  readonly studyMaterials: {
    readonly mindmap: StudyMaterialEntity | null;
    readonly flashcards: StudyMaterialEntity | null;
  };
  // folder view
  readonly folder: Pick<StudyFolderEntity, 'id' | 'name' | 'description' | 'itemCount'> | null;
  readonly folderItems: readonly StudyFolderItemEntity[];
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
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly studyFolderRepository: IStudyFolderRepository,
  ) {}

  async execute(token: string): Promise<Result<SharedResourceData>> {
    const shareLink = await this.shareLinkRepository.findByToken(token);

    if (!shareLink) {
      return fail(new NotFoundException('Share link not found'));
    }

    if (!shareLink.isPublic) {
      return fail(new ForbiddenException('This resource is not public'));
    }

    const base = {
      shareLink: {
        token: shareLink.token,
        resourceType: shareLink.resourceType,
        resourceId: shareLink.resourceId,
      },
      audio: null,
      transcription: null,
      studyMaterials: { mindmap: null, flashcards: null },
      folder: null,
      folderItems: [],
    } as const;

    if (shareLink.resourceType === 'transcription') {
      const audio = await this.audioRepository.findById(shareLink.resourceId);
      if (!audio) return fail(new NotFoundException('Resource not found'));

      const transcription = await this.transcriptionRepository.findByAudioId(shareLink.resourceId);

      let mindmap: StudyMaterialEntity | null = null;
      let flashcards: StudyMaterialEntity | null = null;

      if (transcription?.id && transcription.status === 'COMPLETED') {
        [mindmap, flashcards] = await Promise.all([
          this.studyMaterialRepository.findByTranscriptionIdAndType(transcription.id, StudyMaterialType.MINDMAP),
          this.studyMaterialRepository.findByTranscriptionIdAndType(transcription.id, StudyMaterialType.FLASHCARDS),
        ]);
      }

      return ok({
        ...base,
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

    if (shareLink.resourceType === 'study_folder') {
      const folder = await this.studyFolderRepository.findById(shareLink.resourceId);
      if (!folder) return fail(new NotFoundException('Folder not found'));

      const items = await this.studyFolderRepository.findItemsByFolderId(shareLink.resourceId);

      return ok({
        ...base,
        folder: {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          itemCount: folder.itemCount,
        },
        folderItems: items,
      });
    }

    return fail(new NotFoundException('Resource not found'));
  }
}
