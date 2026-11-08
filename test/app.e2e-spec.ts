import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { Role } from '../src/generated/prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let http: ReturnType<typeof request>;

  const user = {
    name: 'Budi Santoso',
    email: 'Budi@Example.com',
    password: 'S3cretPassw0rd',
  };
  let userToken: string;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health reports the database as up', async () => {
    const res = await http.get('/api/v1/health').expect(200);
    expect(res.body.data.status).toBe('ok');
  });

  describe('auth', () => {
    it('registers a user (email normalized, password hidden)', async () => {
      const res = await http
        .post('/api/v1/auth/register')
        .send(user)
        .expect(201);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Registration successful',
        data: {
          tokenType: 'Bearer',
          user: { email: 'budi@example.com', role: Role.USER },
        },
      });
      expect(res.body.data.user.password).toBeUndefined();
      userToken = res.body.data.accessToken;
      userId = res.body.data.user.id;
    });

    it('rejects a duplicate registration with 409', async () => {
      const res = await http
        .post('/api/v1/auth/register')
        .send(user)
        .expect(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects self-assigned roles and invalid input with 400', async () => {
      const res = await http
        .post('/api/v1/auth/register')
        .send({ ...user, email: 'not-an-email', role: Role.ADMIN })
        .expect(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          'property role should not exist',
          'email must be an email',
        ]),
      );
    });

    it('logs in with valid credentials', async () => {
      const res = await http
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(200);
      expect(res.body.data.accessToken).toEqual(expect.any(String));
    });

    it('rejects a wrong password with 401', () =>
      http
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'wrong-password' })
        .expect(401));

    it('GET /auth/me requires a token', () =>
      http.get('/api/v1/auth/me').expect(401));

    it('GET /auth/me returns the current user', async () => {
      const res = await http
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      expect(res.body.data).toMatchObject({ id: userId, name: user.name });
      expect(res.body.data.password).toBeUndefined();
    });
  });

  describe('users (admin only)', () => {
    beforeAll(async () => {
      await app.get(PrismaService).user.create({
        data: {
          name: 'Admin',
          email: 'admin@example.com',
          password: await import('bcryptjs').then((b) =>
            b.hash('AdminPassw0rd', 4),
          ),
          role: Role.ADMIN,
        },
      });
      const res = await http
        .post('/api/v1/auth/login')
        .send({ email: 'admin@example.com', password: 'AdminPassw0rd' });
      adminToken = res.body.data.accessToken;
    });

    it('forbids regular users with 403', () =>
      http
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403));

    it('lists users with pagination meta', async () => {
      const res = await http
        .get('/api/v1/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 1,
        totalItems: 2,
        totalPages: 2,
      });
    });

    it('rejects a non-UUID id with 400', () =>
      http
        .get('/api/v1/users/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400));

    it('updates a user', async () => {
      const res = await http
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Budi Updated' })
        .expect(200);
      expect(res.body.data.name).toBe('Budi Updated');
    });

    it('soft-deletes a user, then returns 404', async () => {
      await http
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
      await http
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('allows re-registering the email of a deleted user', () =>
      http.post('/api/v1/auth/register').send(user).expect(201));
  });
});
