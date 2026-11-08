import { Role } from '../../users/users.schema';

export interface JwtPayload {
  /** User ID */
  sub: string;
  email: string;
  role: Role;
}
