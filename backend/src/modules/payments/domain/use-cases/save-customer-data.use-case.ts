import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/providers/subscription.repository.impl.js';
import type { SaveCustomerDataDto } from '../../application/dto/save-customer-data.dto.js';

export interface SaveCustomerDataCommand {
  userId: string;
  dto: SaveCustomerDataDto;
}

@Injectable()
export class SaveCustomerDataUseCase {
  private readonly logger = new Logger(SaveCustomerDataUseCase.name);

  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(command: SaveCustomerDataCommand) {
    // Nunca logar PII (nome, email, telefone, CPF) — apenas o userId
    this.logger.log(`Salvando dados de cliente | userId=${command.userId}`);

    const subscription = await this.subscriptionRepository.upsert({
      userId: command.userId,
      customerName: command.dto.name,
      customerEmail: command.dto.email,
      customerCellphone: command.dto.cellphone,
      customerTaxId: command.dto.taxId,
    });

    this.logger.log(`Assinatura salva | userId=${command.userId} | status=${subscription.status}`);

    return {
      hasSubscription: subscription.status === 'active',
      status: subscription.status,
    };
  }
}
