import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Paginated } from '../common/pagination/paginated';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const makeUser = (overrides: Partial<User> = {}): User =>
  Object.assign(new User(), {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Budi',
    email: 'budi@example.com',
    role: Role.USER,
    isActive: true,
    ...overrides,
  });

describe('UsersService', () => {
  let service: UsersService;
  const repo = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findOneBy: jest.fn(),
    findPaginated: jest.fn(),
    create: jest.fn((data: Partial<User>) => Object.assign(new User(), data)),
    merge: jest.fn((target: User, data: Partial<User>) =>
      Object.assign(target, data),
    ),
    save: jest.fn((user: User) => Promise.resolve(user)),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: repo }],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  describe('create', () => {
    it('hashes the password before saving', async () => {
      repo.findByEmail.mockResolvedValue(null);
      const user = await service.create({
        name: 'Budi',
        email: 'budi@example.com',
        password: 'plain-password',
      });
      expect(user.password).not.toBe('plain-password');
      await expect(
        bcrypt.compare('plain-password', user.password),
      ).resolves.toBe(true);
    });

    it('rejects a duplicate email', async () => {
      repo.findByEmail.mockResolvedValue(makeUser());
      await expect(
        service.create({
          name: 'Budi',
          email: 'budi@example.com',
          password: 'plain-password',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  it('findAll returns a Paginated result', async () => {
    repo.findPaginated.mockResolvedValue([[makeUser()], 21]);
    const query = Object.assign(new PaginationQueryDto(), {
      page: 2,
      limit: 10,
    });
    const result = await service.findAll(query);
    expect(result).toBeInstanceOf(Paginated);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      totalItems: 21,
      totalPages: 3,
      itemCount: 1,
    });
  });

  it('findOne throws NotFound when missing', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('update', () => {
    it('rejects changing email to one already taken', async () => {
      repo.findOneBy.mockResolvedValue(makeUser());
      repo.findByEmail.mockResolvedValue(makeUser({ id: 'other' }));
      await expect(
        service.update('id', { email: 'taken@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('does not check availability when email is unchanged', async () => {
      repo.findOneBy.mockResolvedValue(makeUser());
      const user = await service.update('id', {
        email: 'budi@example.com',
        name: 'Budi Baru',
      });
      expect(repo.findByEmail).not.toHaveBeenCalled();
      expect(user.name).toBe('Budi Baru');
    });
  });

  it('remove soft-deletes the user', async () => {
    repo.findOneBy.mockResolvedValue(makeUser());
    await service.remove('id');
    expect(repo.softDelete).toHaveBeenCalledWith('id');
  });
});
