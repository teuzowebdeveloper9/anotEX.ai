import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/providers/subscription.repository.impl.js';
import type { SaveCustomerDataDto } from '../../application/dto/save-customer-data.dto.js';

export interface SaveCustomerDataCommand {
  userId: string;
  dto: SaveCustomerDataDto;
}

@Injectable()
export class SaveCustomerDataUseCase {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(command: SaveCustomerDataCommand) {
    const subscription = await this.subscriptionRepository.upsert({
      userId: command.userId,
      customerName: command.dto.name,
      customerEmail: command.dto.email,
      customerCellphone: command.dto.cellphone,
      customerTaxId: command.dto.taxId,
    });

    return {
      hasSubscription: subscription.status === 'active',
      status: subscription.status,
    };
  }
}
