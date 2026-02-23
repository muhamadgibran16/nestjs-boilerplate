import {
  Entity,
  Unique,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity('user')
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true })
  salt: string;
  @Column({ default: false, name: 'is_active' })
  isActive: boolean;
  @Index()
  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;
  @CreateDateColumn({ type: 'timestamp without time zone', name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp without time zone', name: 'updated_at' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp without time zone', name: 'deleted_at' })
  deletedAt: Date;
}
