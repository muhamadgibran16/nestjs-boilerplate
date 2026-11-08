import { UserDto } from '../../users/dto/user.dto';

export class AuthResponseDto {
  accessToken!: string;
  tokenType!: 'Bearer';
  /** Masa berlaku token, sesuai JWT_EXPIRES_IN. @example "1h" */
  expiresIn!: string;
  user!: UserDto;
}
