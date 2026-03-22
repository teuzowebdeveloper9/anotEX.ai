import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  Res,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { SendMessageUseCase } from '../../domain/use-cases/send-message.use-case.js';
import { GetChatHistoryUseCase } from '../../domain/use-cases/get-chat-history.use-case.js';
import { ClearChatHistoryUseCase } from '../../domain/use-cases/clear-chat-history.use-case.js';
import { SendMessageDto } from '../../application/dto/send-message.dto.js';
import { ChatMessageResponseDto } from '../../application/dto/chat-message-response.dto.js';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getChatHistoryUseCase: GetChatHistoryUseCase,
    private readonly clearChatHistoryUseCase: ClearChatHistoryUseCase,
  ) {}

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post(':transcriptionId')
  async sendMessage(
    @Param('transcriptionId', ParseUUIDPipe) transcriptionId: string,
    @Body() dto: SendMessageDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const token of this.sendMessageUseCase.execute({
        transcriptionId,
        userId: req.user.id,
        userMessage: dto.message,
      })) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (error) {
      this.logger.error('Chat stream error', error);
      const message = error instanceof Error ? error.message : 'Erro interno';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    } finally {
      res.end();
    }
  }

  @Get(':transcriptionId/history')
  async getHistory(
    @Param('transcriptionId', ParseUUIDPipe) transcriptionId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ChatMessageResponseDto[]> {
    const result = await this.getChatHistoryUseCase.execute({
      transcriptionId,
      userId: req.user.id,
    });

    if (!result.success) throw result.error;
    return result.data.map(m => ChatMessageResponseDto.fromEntity(m));
  }

  @Delete(':transcriptionId/history')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearHistory(
    @Param('transcriptionId', ParseUUIDPipe) transcriptionId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const result = await this.clearChatHistoryUseCase.execute({
      transcriptionId,
      userId: req.user.id,
    });

    if (!result.success) throw result.error;
  }
}
