import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { FolderItemType, StudyFolderItemEntity } from '../entities/study-folder.entity.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';

@Injectable()
export class AddItemToFolderUseCase {
  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly folderRepo: IStudyFolderRepository,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepo: ITranscriptionRepository,
  ) {}

  async execute(input: {
    folderId: string;
    userId: string;
    transcriptionId: string;
    itemType: FolderItemType;
  }): Promise<Result<StudyFolderItemEntity>> {
    const folder = await this.folderRepo.findById(input.folderId);
    if (!folder) return fail(new NotFoundException('Pasta não encontrada'));
    if (folder.userId !== input.userId) return fail(new ForbiddenException('Acesso negado'));

    const transcription = await this.transcriptionRepo.findById(input.transcriptionId);
    if (!transcription) return fail(new NotFoundException('Transcrição não encontrada'));
    if (transcription.userId !== input.userId) return fail(new ForbiddenException('Acesso negado'));

    const exists = await this.folderRepo.itemExists(
      input.folderId,
      input.transcriptionId,
      input.itemType,
    );
    if (exists) return fail(new ConflictException('Este material já está na pasta'));

    const item = await this.folderRepo.addItem({
      folderId: input.folderId,
      userId: input.userId,
      transcriptionId: input.transcriptionId,
      itemType: input.itemType,
      title: transcription.title ?? 'Transcrição sem título',
    });

    return ok(item);
  }
}
