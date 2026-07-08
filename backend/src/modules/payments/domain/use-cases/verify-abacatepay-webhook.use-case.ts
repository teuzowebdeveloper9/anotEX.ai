import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

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

/** Comparação de strings resistente a timing side-channel. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

@Injectable()
export class VerifyAbacatepayWebhookUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(command: VerifyAbacatepayWebhookCommand): AbacatepayWebhookEvent {
    const configuredWebhookSecret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET');

    if (!configuredWebhookSecret) {
      throw new UnauthorizedException('AbacatePay webhook secret is not configured');
    }

    // 1) Secret compartilhado — comparação timing-safe (não `!==`)
    if (!command.webhookSecret || !safeEqual(command.webhookSecret, configuredWebhookSecret)) {
      throw new UnauthorizedException('Invalid AbacatePay webhook secret');
    }

    // 2) Defesa extra: se a HMAC key está configurada e o provedor enviou assinatura,
    //    valida o HMAC do corpo cru (timing-safe). Assinatura presente nunca é ignorada;
    //    ausente, o secret compartilhado ainda protege.
    const hmacKey = this.configService.get<string>('ABACATEPAY_PUBLIC_HMAC_KEY');
    if (hmacKey && command.signature) {
      const expected = createHmac('sha256', hmacKey).update(command.rawBody).digest('hex');
      const provided = command.signature.replace(/^sha256=/i, '').trim();
      if (!safeEqual(provided, expected)) {
        throw new UnauthorizedException('Invalid AbacatePay webhook signature');
      }
    }

    return JSON.parse(command.rawBody) as AbacatepayWebhookEvent;
  }
}
