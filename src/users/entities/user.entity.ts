import { Exclude } from 'class-transformer';
import { Column, Entity, Index } from 'typeorm';
import { AbstractEntity } from '../../common/entities/base.entity';
import { Role } from '../enums/role.enum';

@Entity('users')
export class User extends AbstractEntity {
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  // Unik hanya untuk user yang belum di-soft-delete, agar email bisa dipakai ulang.
  @Index('UQ_users_email', { unique: true, where: '"deleted_at" IS NULL' })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  /** Hash bcrypt. Tidak ikut di-SELECT secara default dan tidak pernah diserialisasi. */
  @Exclude()
  @Column({ type: 'varchar', select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    enumName: 'user_role',
    default: Role.USER,
  })
  role!: Role;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Index()
  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified!: boolean;
}
