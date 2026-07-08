import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ABACATEPAY_PROVIDER,
  type AbacatepayCheckoutResponse,
  type IAbacatepayProvider,
} from '../providers/abacatepay.provider.js';
import type { CreateAbacatepayCheckoutDto } from '../../application/dto/create-abacatepay-checkout.dto.js';

export interface CreateAbacatepayCheckoutCommand {
  userId: string;
  dto: CreateAbacatepayCheckoutDto;
}

interface CatalogProduct {
  readonly priceInCents: number;
  readonly name: string;
}

@Injectable()
export class CreateAbacatepayCheckoutUseCase {
  private readonly logger = new Logger(CreateAbacatepayCheckoutUseCase.name);

  constructor(
    @Inject(ABACATEPAY_PROVIDER)
    private readonly abacatepayProvider: IAbacatepayProvider,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Catálogo autoritativo (server-side) montado a partir de ABACATEPAY_PRODUCTS:
   * "productId:priceCents:Nome do produto" separados por vírgula.
   * O preço e o nome NUNCA vêm do cliente — evita o cliente pagar valor arbitrário.
   */
  private buildCatalog(): Map<string, CatalogProduct> {
    const raw = this.configService.get<string>('ABACATEPAY_PRODUCTS') ?? '';
    const catalog = new Map<string, CatalogProduct>();
    for (const entry of raw.split(',').map((e) => e.trim()).filter(Boolean)) {
      const [id, price, ...nameParts] = entry.split(':');
      const priceInCents = Number(price);
      if (id && Number.isInteger(priceInCents) && priceInCents > 0) {
        catalog.set(id, { priceInCents, name: nameParts.join(':').trim() || 'Assinatura' });
      }
    }
    return catalog;
  }

  async execute(command: CreateAbacatepayCheckoutCommand): Promise<AbacatepayCheckoutResponse> {
    const catalog = this.buildCatalog();

    // Fail-closed: sem catálogo configurado ou produto desconhecido → recusa.
    const product = catalog.get(command.dto.productId);
    if (!product) {
      this.logger.warn(`Checkout recusado: produto não permitido | productId=${command.dto.productId}`);
      throw new BadRequestException('Product not allowed');
    }

    const externalId =
      command.dto.externalId ??
      `anotex:${command.userId}:${command.dto.productId}:${Date.now().toString()}`;

    try {
      return await this.abacatepayProvider.createCheckout({
        items: [
          {
            id: command.dto.productId,
            name: product.name,
            quantity: command.dto.quantity,
            // Preço SEMPRE do catálogo do servidor — ignora qualquer valor do cliente
            priceInCents: product.priceInCents,
          },
        ],
        externalId,
        frequency: command.dto.frequency,
        // URLs de retorno vêm apenas da config — nunca do cliente (evita open redirect/phishing)
        returnUrl: this.configService.get<string>('ABACATEPAY_RETURN_URL'),
        completionUrl: this.configService.get<string>('ABACATEPAY_COMPLETION_URL'),
        methods: command.dto.methods,
        metadata: {
          userId: command.userId,
          ...(command.dto.metadata ?? {}),
        },
        customer: command.dto.customer,
      });
    } catch (error) {
      // Loga o detalhe internamente, retorna mensagem genérica ao cliente
      this.logger.error(
        `Falha ao criar checkout AbacatePay | userId=${command.userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to create checkout');
    }
  }
}
