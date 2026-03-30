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
      const billingId = command.data?.id as string | undefined;
      if (!billingId) {
        this.logger.warn('Webhook billing.paid without billing id');
        return;
      }

      const subscription = await this.subscriptionRepository.findByBillingId(billingId);
      if (subscription) {
        await this.subscriptionRepository.updateStatus(subscription.userId, 'active');
        this.logger.log(`Subscription activated for user: ${subscription.userId}`);
      } else {
        this.logger.warn(`Subscription not found for billing id: ${billingId}`);
      }
    }

    if (command.event === 'billing.expired' || command.event === 'billing.cancelled') {
      const billingId = command.data?.id as string | undefined;
      if (!billingId) {
        this.logger.warn(`Webhook ${command.event} without billing id`);
        return;
      }

      const subscription = await this.subscriptionRepository.findByBillingId(billingId);
      if (subscription) {
        await this.subscriptionRepository.updateStatus(subscription.userId, 
          command.event === 'billing.expired' ? 'expired' : 'cancelled'
        );
        this.logger.log(`Subscription ${command.event} for user: ${subscription.userId}`);
      }
    }
  }
}
