import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';

export interface AbacatepayWebhookEvent {
  id?: string;
  event: string;
  apiVersion?: number | string;
  devMode?: boolean;
  data?: Record<string, unknown>;
}

export interface VerifyAbacatepayWebhookCommand {
  webhookSecret?: string;
  signature?: string;
  rawBody: string;
}

@Injectable()
export class VerifyAbacatepayWebhookUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(command: VerifyAbacatepayWebhookCommand): AbacatepayWebhookEvent {
    const configuredWebhookSecret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET');
    const configuredPublicHmacKey = this.configService.get<string>('ABACATEPAY_PUBLIC_HMAC_KEY');

    if (!configuredWebhookSecret) {
      throw new UnauthorizedException('AbacatePay webhook secret is not configured');
    }

    if (command.webhookSecret !== configuredWebhookSecret) {
      throw new UnauthorizedException('Invalid AbacatePay webhook secret');
    }

    if (command.signature) {
      if (!configuredPublicHmacKey) {
        throw new UnauthorizedException('AbacatePay public HMAC key is not configured');
      }

      if (!this.hasValidSignature(command.rawBody, command.signature, configuredPublicHmacKey)) {
        throw new UnauthorizedException('Invalid AbacatePay webhook signature');
      }
    }

    return JSON.parse(command.rawBody) as AbacatepayWebhookEvent;
  }

  private hasValidSignature(
    rawBody: string,
    signatureFromHeader: string,
    publicHmacKey: string,
  ): boolean {
    const normalizedSignature = signatureFromHeader.trim();

    if (!normalizedSignature) {
      throw new UnauthorizedException('Invalid AbacatePay webhook signature');
    }
    const expectedSignature = crypto
      .createHmac('sha256', publicHmacKey)
      .update(Buffer.from(rawBody, 'utf8'))
      .digest('base64');

    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(normalizedSignature);

    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
  }
}
