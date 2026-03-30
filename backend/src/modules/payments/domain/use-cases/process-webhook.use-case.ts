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
      this.logger.log(`Raw webhook data: ${JSON.stringify(command.data)}`);
      
      const billing = command.data?.billing as { 
        id?: string;
        customer?: { metadata?: { email?: string } };
      } | undefined;
      const billingId = billing?.id;
      const rawEmail = billing?.customer?.metadata?.email;
      const customerEmail = rawEmail?.toLowerCase();

      this.logger.log(`Billing ID: ${billingId}, Raw email: ${rawEmail}, Lower email: ${customerEmail}`);

      if (!customerEmail) {
        this.logger.warn('Webhook billing.paid without customer email');
        return;
      }

      const subscription = await this.subscriptionRepository.findByEmail(customerEmail);
      this.logger.log(`Found subscription: ${JSON.stringify(subscription)}`);
      
      if (subscription) {
        if (billingId) {
          await this.subscriptionRepository.updateBillingId(subscription.userId, billingId);
        }
        await this.subscriptionRepository.updateStatus(subscription.userId, 'active');
        this.logger.log(`Subscription activated for user: ${subscription.userId} (email: ${customerEmail})`);
      } else {
        this.logger.warn(`Subscription not found for email: ${customerEmail}`);
      }
    }

    if (command.event === 'billing.expired' || command.event === 'billing.cancelled') {
      const billing = command.data?.billing as { 
        customer?: { metadata?: { email?: string } };
      } | undefined;
      const customerEmail = billing?.customer?.metadata?.email?.toLowerCase();

      if (!customerEmail) {
        this.logger.warn(`Webhook ${command.event} without customer email`);
        return;
      }

      const subscription = await this.subscriptionRepository.findByEmail(customerEmail);
      if (subscription) {
        await this.subscriptionRepository.updateStatus(subscription.userId, 
          command.event === 'billing.expired' ? 'expired' : 'cancelled'
        );
        this.logger.log(`Subscription ${command.event} for user: ${subscription.userId}`);
      }
    }
  }
}
