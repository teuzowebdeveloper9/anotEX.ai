import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './presentation/controllers/payments.controller.js';
import { CreateAbacatepayCheckoutUseCase } from './domain/use-cases/create-abacatepay-checkout.use-case.js';
import { VerifyAbacatepayWebhookUseCase } from './domain/use-cases/verify-abacatepay-webhook.use-case.js';
import { ABACATEPAY_PROVIDER } from './domain/providers/abacatepay.provider.js';
import { AbacatepayProviderImpl } from './infrastructure/providers/abacatepay.provider.impl.js';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [
    CreateAbacatepayCheckoutUseCase,
    VerifyAbacatepayWebhookUseCase,
    {
      provide: ABACATEPAY_PROVIDER,
      useClass: AbacatepayProviderImpl,
    },
  ],
})
export class PaymentModule {}
