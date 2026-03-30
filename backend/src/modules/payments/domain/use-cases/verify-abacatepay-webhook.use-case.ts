import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AbacatepayWebhookEvent {
  id?: string;
  event: string;
  apiVersion?: number | string;
  devMode?: boolean;
  data?: Record<string, unknown>;
}

export interface VerifyAbacatepayWebhookCommand {
  webhookSecret?: string;
  rawBody: string;
}

@Injectable()
export class VerifyAbacatepayWebhookUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(command: VerifyAbacatepayWebhookCommand): AbacatepayWebhookEvent {
    const configuredWebhookSecret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET');

    if (!configuredWebhookSecret) {
      throw new UnauthorizedException('AbacatePay webhook secret is not configured');
    }

    if (command.webhookSecret !== configuredWebhookSecret) {
      throw new UnauthorizedException('Invalid AbacatePay webhook secret');
    }

    return JSON.parse(command.rawBody) as AbacatepayWebhookEvent;
  }
}
