import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { normalizeEmail } from '../../common/transformers/string.transformers';

export class LoginDto {
  /** @example "budi@example.com" */
  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;

  /** @example "S3cretPassw0rd" */
  @IsString()
  @IsNotEmpty()
  password!: string;
}
