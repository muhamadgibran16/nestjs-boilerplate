import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Paginated } from '../common/pagination/paginated';
import { PublicUser } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { NewUser, Role } from './users.schema';
import { UsersService } from './users.service';

const makeUser = (overrides: Partial<PublicUser> = {}): PublicUser => ({
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Budi',
  email: 'budi@example.com',
  phone: null,
  role: Role.USER,
  isActive: true,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  const repo = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findPaginated: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
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
      repo.create.mockResolvedValue(makeUser());
      await service.create({
        name: 'Budi',
        email: 'budi@example.com',
        password: 'plain-password',
      });
      const data = repo.create.mock.calls[0][0] as NewUser;
      expect(data.password).not.toBe('plain-password');
      await expect(
        bcrypt.compare('plain-password', data.password),
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
      expect(repo.create).not.toHaveBeenCalled();
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
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('update', () => {
    it('rejects changing email to one already taken', async () => {
      repo.findById.mockResolvedValue(makeUser());
      repo.findByEmail.mockResolvedValue(makeUser({ id: 'other' }));
      await expect(
        service.update('id', { email: 'taken@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('does not check availability when email is unchanged', async () => {
      repo.findById.mockResolvedValue(makeUser());
      repo.update.mockResolvedValue(makeUser({ name: 'Budi Baru' }));
      const user = await service.update('id', {
        email: 'budi@example.com',
        name: 'Budi Baru',
      });
      expect(repo.findByEmail).not.toHaveBeenCalled();
      expect(user.name).toBe('Budi Baru');
    });
  });

  it('remove soft-deletes the user', async () => {
    repo.findById.mockResolvedValue(makeUser());
    await service.remove('id');
    expect(repo.softDelete).toHaveBeenCalledWith('id');
  });
});
