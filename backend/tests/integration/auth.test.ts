import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Role, UserStatus } from '../../src/generated/prisma/enums';

// Mock stripe to avoid initialization issues
vi.mock('../../src/app/config/stripe.config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

// Mock cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(),
  },
}));

// Mock AuthService
vi.mock('../../src/app/module/auth/auth.service', () => ({
  AuthService: {
    registerPatient: vi.fn(),
    loginUser: vi.fn(),
    getNewToken: vi.fn(),
    getMe: vi.fn(),
    changePassword: vi.fn(),
    logoutUser: vi.fn(),
  },
}));

// Mock Prisma for checkAuth session resolution
const { mockSession, mockUser } = vi.hoisted(() => ({
  mockSession: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  mockUser: {
    findUnique: vi.fn(),
  },
}));

vi.mock('../../src/app/lib/prisma', () => ({
  prisma: {
    session: mockSession,
    user: mockUser,
  },
}));

import app from '../../src/app';
import { AuthService } from '../../src/app/module/auth/auth.service';

describe('Auth Integration Tests (supertest)', () => {
  const testSecret = process.env.ACCESS_TOKEN_SECRET || 'test-access-token-secret-1234567890';
  const validSessionToken = 'valid-session-token-xyz';

  const validUser = {
    id: 'user-patient-123',
    email: 'patient@medix.health',
    role: Role.PATIENT,
    status: UserStatus.ACTIVE,
    isDeleted: false,
    name: 'Jane Doe',
  };

  const validToken = jwt.sign(
    {
      userId: validUser.id,
      email: validUser.email,
      role: validUser.role,
    },
    testSecret,
    { expiresIn: '1h' }
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('successfully registers patient and returns 201 with auth cookies', async () => {
      vi.mocked(AuthService.registerPatient).mockResolvedValue({
        token: validSessionToken,
        accessToken: validToken,
        refreshToken: 'mock-refresh-token',
        user: validUser,
      } as never);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'patient@medix.health',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/registered successfully/i);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      // Verify cookies set in headers
      const setCookies = res.headers['set-cookie'] as unknown as string[];
      expect(setCookies).toBeDefined();
      expect(setCookies.some((c) => c.includes('accessToken='))).toBe(true);
      expect(setCookies.some((c) => c.includes('refreshToken='))).toBe(true);
      expect(setCookies.some((c) => c.includes('better-auth.session_token='))).toBe(true);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('successfully authenticates user and sets session and token cookies', async () => {
      vi.mocked(AuthService.loginUser).mockResolvedValue({
        token: validSessionToken,
        accessToken: validToken,
        refreshToken: 'mock-refresh-token',
        user: validUser,
      } as never);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'patient@medix.health',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/logged in successfully/i);
      expect(res.body.data.user.email).toBe('patient@medix.health');

      const setCookies = res.headers['set-cookie'] as unknown as string[];
      expect(setCookies.some((c) => c.includes('accessToken='))).toBe(true);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('returns 401 when refresh token cookie is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send();

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/session token and refresh token are required/i);
    });

    it('returns 200 with new access token when valid cookies are sent', async () => {
      vi.mocked(AuthService.getNewToken).mockResolvedValue({
        accessToken: 'brand-new-access-token',
        refreshToken: 'brand-new-refresh-token',
      } as never);

      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', [
          `refreshToken=valid-refresh-token`,
          `better-auth.session_token=${validSessionToken}`,
        ]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('brand-new-access-token');
    });
  });

  describe('Protected Endpoints & Token Rejection', () => {
    it('rejects GET /api/v1/auth/me with 401 when no session token is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/no session token provided/i);
    });

    it('rejects GET /api/v1/auth/me with 401 when session does not exist in DB', async () => {
      mockSession.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`better-auth.session_token=unknown-token`]);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid or expired session/i);
    });

    it('rejects GET /api/v1/auth/me with 401 when access token is missing or malformed', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-1',
        token: validSessionToken,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: validUser,
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`better-auth.session_token=${validSessionToken}`])
        .set('Authorization', 'Bearer invalid.corrupted.jwt');

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid access token/i);
    });

    it('allows GET /api/v1/auth/me when valid session and valid access token are provided', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-1',
        token: validSessionToken,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: validUser,
      });

      vi.mocked(AuthService.getMe).mockResolvedValue({
        id: validUser.id,
        email: validUser.email,
        name: validUser.name,
        role: validUser.role,
        patient: { id: 'patient-profile-1' },
      } as never);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [
          `better-auth.session_token=${validSessionToken}`,
          `accessToken=${validToken}`,
        ]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(validUser.email);
    });
  });
});
