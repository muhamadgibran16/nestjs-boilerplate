import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Paginated } from '../common/pagination/paginated';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { User } from './users.schema';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    await this.ensureEmailAvailable(dto.email);
    return this.usersRepository.create({
      ...dto,
      password: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    });
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<PublicUser>> {
    const [items, total] = await this.usersRepository.findPaginated(query);
    return new Paginated(items, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<PublicUser> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const user = await this.findOne(id);
    if (dto.email && dto.email !== user.email) {
      await this.ensureEmailAvailable(dto.email);
    }
    return this.usersRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.usersRepository.softDelete(id);
  }

  private async ensureEmailAvailable(email: string): Promise<void> {
    if (await this.usersRepository.findByEmail(email)) {
      throw new ConflictException('Email is already registered');
    }
  }
}
