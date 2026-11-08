import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';

export const ROLES_KEY = 'roles';

/** Batasi route hanya untuk role tertentu. Tanpa decorator ini, semua user login boleh akses. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
