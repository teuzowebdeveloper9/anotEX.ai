import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { CreateFolderUseCase } from '../../domain/use-cases/create-folder.use-case.js';
import { ListFoldersUseCase } from '../../domain/use-cases/list-folders.use-case.js';
import { GetFolderUseCase } from '../../domain/use-cases/get-folder.use-case.js';
import { UpdateFolderUseCase } from '../../domain/use-cases/update-folder.use-case.js';
import { DeleteFolderUseCase } from '../../domain/use-cases/delete-folder.use-case.js';
import { AddItemToFolderUseCase } from '../../domain/use-cases/add-item-to-folder.use-case.js';
import { RemoveItemFromFolderUseCase } from '../../domain/use-cases/remove-item-from-folder.use-case.js';
import { GetFolderRecommendationsUseCase } from '../../domain/use-cases/get-folder-recommendations.use-case.js';
import { CreateFolderDto } from '../../application/dto/create-folder.dto.js';
import { UpdateFolderDto } from '../../application/dto/update-folder.dto.js';
import { AddItemDto } from '../../application/dto/add-item.dto.js';

@Controller('study-folders')
export class StudyFolderController {
  constructor(
    private readonly createFolderUseCase: CreateFolderUseCase,
    private readonly listFoldersUseCase: ListFoldersUseCase,
    private readonly getFolderUseCase: GetFolderUseCase,
    private readonly updateFolderUseCase: UpdateFolderUseCase,
    private readonly deleteFolderUseCase: DeleteFolderUseCase,
    private readonly addItemUseCase: AddItemToFolderUseCase,
    private readonly removeItemUseCase: RemoveItemFromFolderUseCase,
    private readonly getRecommendationsUseCase: GetFolderRecommendationsUseCase,
  ) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const result = await this.listFoldersUseCase.execute(req.user.id);
    if (!result.success) throw result.error;
    return result.data;
  }

  @Post()
  async create(@Body() dto: CreateFolderDto, @Req() req: AuthenticatedRequest) {
    const result = await this.createFolderUseCase.execute({
      userId: req.user.id,
      name: dto.name,
      description: dto.description,
    });
    if (!result.success) throw result.error;
    return result.data;
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.getFolderUseCase.execute({ folderId: id, userId: req.user.id });
    if (!result.success) throw result.error;
    return result.data;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFolderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.updateFolderUseCase.execute({
      folderId: id,
      userId: req.user.id,
      name: dto.name,
      description: dto.description,
    });
    if (!result.success) throw result.error;
    return result.data;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.deleteFolderUseCase.execute({ folderId: id, userId: req.user.id });
    if (!result.success) throw result.error;
  }

  @Post(':id/items')
  async addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.addItemUseCase.execute({
      folderId: id,
      userId: req.user.id,
      transcriptionId: dto.transcriptionId,
      itemType: dto.itemType,
    });
    if (!result.success) throw result.error;
    return result.data;
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.removeItemUseCase.execute({ itemId, userId: req.user.id });
    if (!result.success) throw result.error;
  }

  @Get(':id/recommendations')
  async getRecommendations(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.getRecommendationsUseCase.execute({
      folderId: id,
      userId: req.user.id,
    });
    if (!result.success) throw result.error;
    return result.data;
  }
}
