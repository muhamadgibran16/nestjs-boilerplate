import { Role, User } from '../users.schema';

/** Data user yang aman dikirim ke client (tanpa password). */
export type PublicUser = Omit<User, 'password'>;

/** Bentuk response user (untuk dokumentasi Swagger). */
export class UserDto implements PublicUser {
  id!: string;
  name!: string;
  email!: string;
  phone!: string | null;
  role!: Role;
  isActive!: boolean;
  isVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
}
