import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateAbacatepayCheckoutDto {
  @IsString()
  productId!: string;

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
  @IsUrl({
    require_protocol: true,
  })
  returnUrl?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  completionUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  methods?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
