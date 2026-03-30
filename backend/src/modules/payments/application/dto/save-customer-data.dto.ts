import { IsString, IsEmail, MinLength } from 'class-validator';

export class SaveCustomerDataDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10)
  cellphone!: string;

  @IsString()
  @MinLength(8)
  taxId!: string;
}
