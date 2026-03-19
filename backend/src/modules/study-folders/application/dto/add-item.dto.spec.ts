import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddItemDto } from './add-item.dto.js';

describe('AddItemDto', () => {
  it('aceita itemType QUIZ', async () => {
    const dto = plainToInstance(AddItemDto, {
      transcriptionId: '9d0dd337-b97e-404c-8842-c6e6f8e89d75',
      itemType: 'QUIZ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejeita itemType inválido', async () => {
    const dto = plainToInstance(AddItemDto, {
      transcriptionId: '9d0dd337-b97e-404c-8842-c6e6f8e89d75',
      itemType: 'VIDEO',
    });

    const errors = await validate(dto);

    expect(errors).not.toHaveLength(0);
  });
});
