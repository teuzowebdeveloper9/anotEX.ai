import { Controller, Delete, Get, HttpCode, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { DeleteAccountUseCase } from '../../domain/use-cases/delete-account.use-case.js';
import { ExportUserDataUseCase } from '../../domain/use-cases/export-user-data.use-case.js';
import type { UserDataExport } from '../../domain/use-cases/export-user-data.use-case.js';

@Controller('user')
export class UserController {
  constructor(
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly exportUserDataUseCase: ExportUserDataUseCase,
  ) {}

  // LGPD Art. 18 — Direito à portabilidade
  @Get('export')
  async exportData(@Req() req: AuthenticatedRequest): Promise<UserDataExport> {
    return this.exportUserDataUseCase.execute(req.user.id);
  }

  // LGPD Art. 18 — Direito à eliminação
  @Delete()
  @HttpCode(204)
  async deleteAccount(@Req() req: AuthenticatedRequest): Promise<void> {
    await this.deleteAccountUseCase.execute(req.user.id);
  }
}
