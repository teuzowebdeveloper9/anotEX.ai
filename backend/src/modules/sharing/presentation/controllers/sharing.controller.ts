import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { Public } from '../../../../shared/presentation/decorators/public.decorator.js';
import { CreateShareLinkUseCase } from '../../domain/use-cases/create-share-link.use-case.js';
import { ToggleShareVisibilityUseCase } from '../../domain/use-cases/toggle-share-visibility.use-case.js';
import { GetMyShareLinksUseCase } from '../../domain/use-cases/get-my-share-links.use-case.js';
import { DeleteShareLinkUseCase } from '../../domain/use-cases/delete-share-link.use-case.js';
import { GetSharedResourceUseCase } from '../../domain/use-cases/get-shared-resource.use-case.js';
import { CreateShareLinkDto } from '../../application/dto/create-share-link.dto.js';
import { ToggleVisibilityDto } from '../../application/dto/toggle-visibility.dto.js';

@Controller('sharing')
export class SharingController {
  constructor(
    private readonly createShareLinkUseCase: CreateShareLinkUseCase,
    private readonly toggleShareVisibilityUseCase: ToggleShareVisibilityUseCase,
    private readonly getMyShareLinksUseCase: GetMyShareLinksUseCase,
    private readonly deleteShareLinkUseCase: DeleteShareLinkUseCase,
    private readonly getSharedResourceUseCase: GetSharedResourceUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createShareLink(
    @Body() dto: CreateShareLinkDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.createShareLinkUseCase.execute({
      userId: req.user.id,
      resourceType: dto.resourceType as 'transcription' | 'audio' | 'study_material',
      resourceId: dto.resourceId,
    });

    if (!result.success) throw result.error;
    return result.data;
  }

  @Get()
  async getMyShareLinks(@Req() req: AuthenticatedRequest) {
    const result = await this.getMyShareLinksUseCase.execute(req.user.id);
    if (!result.success) throw result.error;
    return result.data;
  }

  @Public()
  @Get('public/:token')
  async getSharedResource(@Param('token') token: string) {
    const result = await this.getSharedResourceUseCase.execute(token);
    if (!result.success) throw result.error;
    return result.data;
  }

  @Patch(':id/toggle')
  async toggleVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleVisibilityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.toggleShareVisibilityUseCase.execute({
      shareLinkId: id,
      userId: req.user.id,
      isPublic: dto.isPublic,
    });

    if (!result.success) throw result.error;
    return result.data;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShareLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.deleteShareLinkUseCase.execute({
      shareLinkId: id,
      userId: req.user.id,
    });

    if (!result.success) throw result.error;
  }
}
