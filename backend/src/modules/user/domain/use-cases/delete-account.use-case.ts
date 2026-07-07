import { Injectable, Inject, Logger } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import { AUDIO_REPOSITORY } from '../../../audio/domain/repositories/audio.repository.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import { STORAGE_REPOSITORY } from '../../../audio/domain/repositories/storage.repository.js';
import type { IStorageRepository } from '../../../audio/domain/repositories/storage.repository.js';

@Injectable()
export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    private readonly postgresService: PostgresService,
    @Inject(AUDIO_REPOSITORY) private readonly audioRepository: IAudioRepository,
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: IStorageRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    // 1. Buscar todos os áudios para obter as storage keys
    const audios = await this.audioRepository.findByUserId(userId);
    this.logger.log(`Deletando conta | userId=${userId} | audios=${audios.length}`);

    // 2. Deletar arquivos do storage (best-effort — não bloqueia se falhar)
    for (const audio of audios) {
      await this.storageRepository.delete(audio.storageKey).catch((err: unknown) => {
        this.logger.warn(`Falha ao deletar storage | key=${audio.storageKey} | ${err instanceof Error ? err.message : String(err)}`);
      });
    }

    // 3. Deletar usuário do banco — FKs ON DELETE CASCADE limpam o restante dos dados
    await this.postgresService.query('DELETE FROM users WHERE id = $1', [userId]);

    this.logger.log(`Conta deletada com sucesso | userId=${userId}`);
  }
}
