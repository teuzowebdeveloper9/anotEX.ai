import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAbacatepayCheckoutDto {
  @IsString()
  productId!: string;

  // priceInCents, returnUrl e completionUrl foram REMOVIDOS de propósito:
  // eram controlados pelo cliente e permitiam pagar valor arbitrário / open redirect.
  // O preço e as URLs de retorno são resolvidos exclusivamente no backend.

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number = 1;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  frequency?: 'ONE_TIME' | 'SUBSCRIPTION';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  methods?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  @IsOptional()
  @IsObject()
  customer?: {
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
  };
}
