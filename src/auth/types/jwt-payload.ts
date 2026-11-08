import { Role } from '../../users/enums/role.enum';

export interface JwtPayload {
  /** User ID */
  sub: string;
  email: string;
  role: Role;
}
