import { Body, Controller, Headers, HttpCode, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { Public } from '../../../../shared/presentation/decorators/public.decorator.js';
import type { AbacatepayCheckoutResponse } from '../../domain/providers/abacatepay.provider.js';
import { CreateAbacatepayCheckoutUseCase } from '../../domain/use-cases/create-abacatepay-checkout.use-case.js';
import { CreateAbacatepayCheckoutDto } from '../../application/dto/create-abacatepay-checkout.dto.js';
import {
  type AbacatepayWebhookEvent,
  VerifyAbacatepayWebhookUseCase,
} from '../../domain/use-cases/verify-abacatepay-webhook.use-case.js';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly createAbacatepayCheckoutUseCase: CreateAbacatepayCheckoutUseCase,
    private readonly verifyAbacatepayWebhookUseCase: VerifyAbacatepayWebhookUseCase,
  ) {}

  @Post('abacatepay/checkout')
  async createAbacatepayCheckout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAbacatepayCheckoutDto,
  ): Promise<AbacatepayCheckoutResponse> {
    return this.createAbacatepayCheckoutUseCase.execute({
      userId: req.user.id,
      dto,
    });
  }

  @Public()
  @Post('abacatepay/webhook')
  @HttpCode(200)
  async handleAbacatepayWebhook(
    @Req() req: RawBodyRequest,
    @Query('webhookSecret') webhookSecret?: string,
    @Headers('x-webhook-signature') signature?: string,
  ): Promise<{ received: true; event: string; logId: string | null }> {
    const rawBody = req.rawBody?.toString('utf8') ?? JSON.stringify(req.body ?? {});
    const event = this.verifyAbacatepayWebhookUseCase.execute({
      webhookSecret,
      signature,
      rawBody,
    });

    return this.toWebhookAck(event);
  }

  private toWebhookAck(event: AbacatepayWebhookEvent): {
    received: true;
    event: string;
    logId: string | null;
  } {
    return {
      received: true,
      event: event.event,
      logId: event.id ?? null,
    };
  }
}
