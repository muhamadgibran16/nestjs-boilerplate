import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Role, User } from '../users/users.schema';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    create: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findOne: jest.fn(),
  };
  const jwtService = { signAsync: jest.fn().mockResolvedValue('signed.jwt') };
  const config = { get: jest.fn().mockReturnValue('1h') };

  const user = (overrides: Partial<User> = {}): User => ({
    id: 'user-id',
    name: 'Budi',
    email: 'budi@example.com',
    phone: null,
    role: Role.USER,
    isActive: true,
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    password: bcrypt.hashSync('correct-password', 4),
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it('register always creates a regular user and returns a token', async () => {
    usersService.create.mockResolvedValue(user());
    const result = await service.register({
      name: 'Budi',
      email: 'budi@example.com',
      password: 'correct-password',
    });
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: Role.USER }),
    );
    expect(result).toMatchObject({
      accessToken: 'signed.jwt',
      tokenType: 'Bearer',
      expiresIn: '1h',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'budi@example.com',
      role: Role.USER,
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(user());
      await expect(
        service.login({
          email: 'budi@example.com',
          password: 'correct-password',
        }),
      ).resolves.toMatchObject({ accessToken: 'signed.jwt' });
    });

    it('never returns the password hash', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(user());
      const result = await service.login({
        email: 'budi@example.com',
        password: 'correct-password',
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('rejects a wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(user());
      await expect(
        service.login({
          email: 'budi@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an unknown email with the same error', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: 'whatever' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('rejects an inactive account', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(
        user({ isActive: false }),
      );
      await expect(
        service.login({
          email: 'budi@example.com',
          password: 'correct-password',
        }),
      ).rejects.toThrow('Account is inactive');
    });
  });
});
