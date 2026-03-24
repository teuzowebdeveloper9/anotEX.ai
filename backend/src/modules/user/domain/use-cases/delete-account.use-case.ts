import { Injectable, Inject, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import { AUDIO_REPOSITORY } from '../../../audio/domain/repositories/audio.repository.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import { STORAGE_REPOSITORY } from '../../../audio/domain/repositories/storage.repository.js';
import type { IStorageRepository } from '../../../audio/domain/repositories/storage.repository.js';

@Injectable()
export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(AUDIO_REPOSITORY) private readonly audioRepository: IAudioRepository,
    @Inject(STORAGE_REPOSITORY) private readonly storageRepository: IStorageRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    // 1. Buscar todos os áudios para obter as storage keys
    const audios = await this.audioRepository.findByUserId(userId);
    this.logger.log(`Deletando conta | userId=${userId} | audios=${audios.length}`);

    // 2. Deletar arquivos do R2 (best-effort — não bloqueia se falhar)
    for (const audio of audios) {
      await this.storageRepository.delete(audio.storageKey).catch((err: unknown) => {
        this.logger.warn(`Falha ao deletar R2 | key=${audio.storageKey} | ${err instanceof Error ? err.message : String(err)}`);
      });
    }

    // 3. Deletar usuário do Supabase Auth — cascade deleta todos os dados no DB
    const { error } = await this.supabaseService.getClient().auth.admin.deleteUser(userId);

    if (error) {
      this.logger.error(`Falha ao deletar usuário do Supabase Auth | userId=${userId} | ${error.message}`);
      throw new Error(`Failed to delete user account: ${error.message}`);
    }

    this.logger.log(`Conta deletada com sucesso | userId=${userId}`);
  }
}
