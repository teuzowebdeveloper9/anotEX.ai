import { ForbiddenException } from '@nestjs/common';
import { CreateShareLinkUseCase } from './create-share-link.use-case.js';
import type { IShareLinkRepository } from '../repositories/share-link.repository.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import type { IStudyMaterialRepository } from '../../../study-materials/domain/repositories/study-material.repository.js';
import type { IStudyFolderRepository } from '../../../study-folders/domain/repositories/study-folder.repository.js';

describe('CreateShareLinkUseCase', () => {
  let useCase: CreateShareLinkUseCase;
  let shareLinkRepository: jest.Mocked<IShareLinkRepository>;
  let audioRepository: jest.Mocked<IAudioRepository>;
  let transcriptionRepository: jest.Mocked<ITranscriptionRepository>;
  let studyMaterialRepository: jest.Mocked<IStudyMaterialRepository>;
  let studyFolderRepository: jest.Mocked<IStudyFolderRepository>;

  beforeEach(() => {
    shareLinkRepository = { findOrCreate: jest.fn() } as unknown as jest.Mocked<IShareLinkRepository>;
    audioRepository = { findById: jest.fn() } as unknown as jest.Mocked<IAudioRepository>;
    transcriptionRepository = { findById: jest.fn() } as unknown as jest.Mocked<ITranscriptionRepository>;
    studyMaterialRepository = { findById: jest.fn() } as unknown as jest.Mocked<IStudyMaterialRepository>;
    studyFolderRepository = { findById: jest.fn() } as unknown as jest.Mocked<IStudyFolderRepository>;

    useCase = new CreateShareLinkUseCase(
      shareLinkRepository,
      audioRepository,
      transcriptionRepository,
      studyMaterialRepository,
      studyFolderRepository,
    );
  });

  describe('execute', () => {
    it('cria o link quando o usuário é dono do áudio', async () => {
      audioRepository.findById.mockResolvedValue({ id: 'a1', userId: 'user-1' } as never);
      shareLinkRepository.findOrCreate.mockResolvedValue({ id: 'link-1' } as never);

      const result = await useCase.execute({
        userId: 'user-1',
        resourceType: 'transcription',
        resourceId: 'a1',
      });

      expect(result.success).toBe(true);
      expect(shareLinkRepository.findOrCreate).toHaveBeenCalledWith({
        ownerId: 'user-1',
        resourceType: 'transcription',
        resourceId: 'a1',
      });
    });

    it('recusa (Forbidden) quando o recurso pertence a outro usuário — previne IDOR', async () => {
      audioRepository.findById.mockResolvedValue({ id: 'a1', userId: 'outro-user' } as never);
      transcriptionRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        userId: 'user-1',
        resourceType: 'transcription',
        resourceId: 'a1',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ForbiddenException);
      }
      expect(shareLinkRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it('recusa quando o recurso não existe', async () => {
      audioRepository.findById.mockResolvedValue(null);
      transcriptionRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        userId: 'user-1',
        resourceType: 'audio',
        resourceId: 'inexistente',
      });

      expect(result.success).toBe(false);
      expect(shareLinkRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it('valida ownership de pasta de estudo pelo repositório correto', async () => {
      studyFolderRepository.findById.mockResolvedValue({ id: 'f1', userId: 'user-1' } as never);
      shareLinkRepository.findOrCreate.mockResolvedValue({ id: 'link-2' } as never);

      const result = await useCase.execute({
        userId: 'user-1',
        resourceType: 'study_folder',
        resourceId: 'f1',
      });

      expect(result.success).toBe(true);
      expect(studyFolderRepository.findById).toHaveBeenCalledWith('f1');
    });
  });
});
