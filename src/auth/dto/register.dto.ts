import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';

/** Registrasi publik: role tidak bisa dipilih sendiri (selalu `user`). */
export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {}
