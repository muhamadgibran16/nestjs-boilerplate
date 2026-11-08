import { Role } from '../../generated/prisma/client';

export interface JwtPayload {
  /** User ID */
  sub: string;
  email: string;
  role: Role;
}
