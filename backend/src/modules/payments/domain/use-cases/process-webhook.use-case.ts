import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/providers/subscription.repository.impl.js';

export interface ProcessWebhookCommand {
  event: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class ProcessWebhookUseCase {
  private readonly logger = new Logger(ProcessWebhookUseCase.name);

  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(command: ProcessWebhookCommand): Promise<void> {
    this.logger.log(`Processing webhook event: ${command.event}`);

    if (command.event === 'billing.paid') {
      const billing = command.data?.billing as { id?: string } | undefined;
      const customer = command.data?.customer as { metadata?: { email?: string } } | undefined;
      const billingId = billing?.id;
      const customerEmail = customer?.metadata?.email;

      // Casa preferencialmente pelo billingId (vínculo confiável gravado no checkout);
      // email é fallback (é dado fornecido pelo usuário, spoofável em payload forjado)
      const subscription =
        (billingId ? await this.subscriptionRepository.findByBillingId(billingId) : null) ??
        (customerEmail ? await this.subscriptionRepository.findByEmail(customerEmail) : null);

      if (!subscription) {
        this.logger.warn('Webhook billing.paid: assinatura não encontrada (billingId/email)');
        return;
      }

      if (billingId) {
        await this.subscriptionRepository.updateBillingId(subscription.userId, billingId);
      }
      await this.subscriptionRepository.updateStatus(subscription.userId, 'active');
      this.logger.log(`Assinatura ativada | userId=${subscription.userId}`);
    }

    if (command.event === 'billing.expired' || command.event === 'billing.cancelled') {
      const billing = command.data?.billing as { id?: string } | undefined;
      const customer = command.data?.customer as { metadata?: { email?: string } } | undefined;
      const billingId = billing?.id;
      const customerEmail = customer?.metadata?.email;

      const subscription =
        (billingId ? await this.subscriptionRepository.findByBillingId(billingId) : null) ??
        (customerEmail ? await this.subscriptionRepository.findByEmail(customerEmail) : null);

      if (subscription) {
        await this.subscriptionRepository.updateStatus(
          subscription.userId,
          command.event === 'billing.expired' ? 'expired' : 'cancelled',
        );
        this.logger.log(`Assinatura ${command.event} | userId=${subscription.userId}`);
      }
    }
  }
}
