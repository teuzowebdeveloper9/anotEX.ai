import { Body, Controller, HttpCode, Post, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { Public } from '../../../../shared/presentation/decorators/public.decorator.js';
import type { AbacatepayCheckoutResponse } from '../../domain/providers/abacatepay.provider.js';
import { CreateAbacatepayCheckoutUseCase } from '../../domain/use-cases/create-abacatepay-checkout.use-case.js';
import { CreateAbacatepayCheckoutDto } from '../../application/dto/create-abacatepay-checkout.dto.js';
import { SaveCustomerDataDto } from '../../application/dto/save-customer-data.dto.js';
import { SaveCustomerDataUseCase } from '../../domain/use-cases/save-customer-data.use-case.js';
import { SubscriptionRepository } from '../../infrastructure/providers/subscription.repository.impl.js';
import {
  type AbacatepayWebhookEvent,
  VerifyAbacatepayWebhookUseCase,
} from '../../domain/use-cases/verify-abacatepay-webhook.use-case.js';
import { ProcessWebhookUseCase } from '../../domain/use-cases/process-webhook.use-case.js';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly createAbacatepayCheckoutUseCase: CreateAbacatepayCheckoutUseCase,
    private readonly saveCustomerDataUseCase: SaveCustomerDataUseCase,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly verifyAbacatepayWebhookUseCase: VerifyAbacatepayWebhookUseCase,
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
  ) {}

  @Post('save-customer-data')
  async saveCustomerData(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SaveCustomerDataDto,
  ) {
    return this.saveCustomerDataUseCase.execute({
      userId: req.user.id,
      dto,
    });
  }

  @Get('subscription-status')
  async getSubscriptionStatus(@Req() req: AuthenticatedRequest) {
    const subscription = await this.subscriptionRepository.findByUserId(req.user.id);
    
    if (!subscription) {
      return { hasSubscription: false, status: null };
    }

    return {
      hasSubscription: subscription.status === 'active',
      status: subscription.status,
    };
  }

  @Post('abacatepay/checkout')
  async createAbacatepayCheckout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAbacatepayCheckoutDto,
  ): Promise<AbacatepayCheckoutResponse> {
    const subscription = await this.subscriptionRepository.findByUserId(req.user.id);
    
    const customerData = dto.customer ?? (subscription ? {
      name: subscription.customerName,
      email: subscription.customerEmail,
      cellphone: subscription.customerCellphone,
      taxId: subscription.customerTaxId,
    } : undefined);

    if (!customerData) {
      throw new Error('Customer data required. Please save customer data first.');
    }

    const result = await this.createAbacatepayCheckoutUseCase.execute({
      userId: req.user.id,
      dto: {
        ...dto,
        customer: customerData,
      },
    });

    if (result.id) {
      console.log(`[PaymentsController] Saving billingId ${result.id} for user ${req.user.id}`);
      await this.subscriptionRepository.updateBillingId(req.user.id, result.id);
    }

    return result;
  }

  @Public()
  @Post('abacatepay/webhook')
  @HttpCode(200)
  async handleAbacatepayWebhook(
    @Req() req: RawBodyRequest,
    @Query('webhookSecret') webhookSecret?: string,
  ): Promise<{ received: true; event: string; logId: string | null }> {
    const rawBody = req.rawBody?.toString('utf8') ?? JSON.stringify(req.body ?? {});
    const event = this.verifyAbacatepayWebhookUseCase.execute({
      webhookSecret,
      rawBody,
    });

    await this.processWebhookUseCase.execute({
      event: event.event,
      data: event.data,
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
