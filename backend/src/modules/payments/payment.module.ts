import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './presentation/controllers/payments.controller.js';
import { CreateAbacatepayCheckoutUseCase } from './domain/use-cases/create-abacatepay-checkout.use-case.js';
import { SaveCustomerDataUseCase } from './domain/use-cases/save-customer-data.use-case.js';
import { VerifyAbacatepayWebhookUseCase } from './domain/use-cases/verify-abacatepay-webhook.use-case.js';
import { ProcessWebhookUseCase } from './domain/use-cases/process-webhook.use-case.js';
import { ABACATEPAY_PROVIDER } from './domain/providers/abacatepay.provider.js';
import { AbacatepayProviderImpl } from './infrastructure/providers/abacatepay.provider.impl.js';
import { SubscriptionRepository } from './infrastructure/providers/subscription.repository.impl.js';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [
    CreateAbacatepayCheckoutUseCase,
    SaveCustomerDataUseCase,
    VerifyAbacatepayWebhookUseCase,
    ProcessWebhookUseCase,
    SubscriptionRepository,
    {
      provide: ABACATEPAY_PROVIDER,
      useClass: AbacatepayProviderImpl,
    },
  ],
})
export class PaymentModule {}
