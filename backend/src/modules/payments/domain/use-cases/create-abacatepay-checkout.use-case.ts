import {
  Inject,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class CreateAbacatepayCheckoutUseCase {
  constructor(
    @Inject(ABACATEPAY_PROVIDER)
    private readonly abacatepayProvider: IAbacatepayProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CreateAbacatepayCheckoutCommand): Promise<AbacatepayCheckoutResponse> {
    const externalId =
      command.dto.externalId ??
      `anotex:${command.userId}:${command.dto.productId}:${Date.now().toString()}`;

    try {
      return await this.abacatepayProvider.createCheckout({
        items: [
          {
            id: command.dto.productId,
            quantity: command.dto.quantity,
            priceInCents: command.dto.priceInCents,
          },
        ],
        externalId,
        frequency: command.dto.frequency,
        returnUrl: command.dto.returnUrl ?? this.configService.get<string>('ABACATEPAY_RETURN_URL'),
        completionUrl:
          command.dto.completionUrl ?? this.configService.get<string>('ABACATEPAY_COMPLETION_URL'),
        methods: command.dto.methods,
        metadata: {
          userId: command.userId,
          ...(command.dto.metadata ?? {}),
        },
        customer: command.dto.customer,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to create AbacatePay checkout',
      );
    }
  }

}
