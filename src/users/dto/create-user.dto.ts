import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  normalizeEmail,
  trim,
} from '../../common/transformers/string.transformers';
import { Role } from '../../generated/prisma/client';

export class CreateUserDto {
  /** @example "Budi Santoso" */
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  /** @example "budi@example.com" */
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(255)
  email!: string;

  /** Nomor telepon format internasional. @example "+6281234567890" */
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  /** @example "S3cretPassw0rd" */
  @IsString()
  @MinLength(8)
  @MaxLength(72) // batas input bcrypt
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
