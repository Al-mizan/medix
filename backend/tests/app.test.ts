import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock stripe to prevent initialization error
vi.mock('../src/app/config/stripe.config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

// Mock cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(),
  },
}));

import app from '../src/app';

describe('Express Application (Supertest)', () => {
  it('GET / should return 201 with health check message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "PH Healthcare's API is working",
    });
  });

  it('GET /api/v1/openapi.json should return 200 with valid OpenAPI 3.0 specification', async () => {
    const res = await request(app).get('/api/v1/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info.title).toBe('Medix Healthcare API');
    expect(res.body.paths).toHaveProperty('/auth/login');
    expect(res.body.paths).toHaveProperty('/appointments/status/{id}');
  });

  it('GET /api-docs/ should return 200 with Swagger UI HTML', async () => {
    const res = await request(app).get('/api-docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('GET /api/v1/openapi.json should support gzip compression', async () => {
    const res = await request(app)
      .get('/api/v1/openapi.json')
      .set('Accept-Encoding', 'gzip');

    expect(res.status).toBe(200);
    expect(res.headers['content-encoding']).toBe('gzip');
  });

  it('POST /api/auth/* should be protected by Auth Tier rate limiting (10 req/min)', async () => {
    const ip = '192.168.100.1';

    for (let i = 1; i <= 10; i++) {
      const res = await request(app)
        .post('/api/auth/sign-in')
        .set('X-Forwarded-For', ip);

      expect(res.headers['x-ratelimit-limit']).toBe('10');
      expect(res.headers['x-ratelimit-remaining']).toBe((10 - i).toString());
    }

    const blockedRes = await request(app)
      .post('/api/auth/sign-in')
      .set('X-Forwarded-For', ip);

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.success).toBe(false);
    expect(blockedRes.headers['retry-after']).toBeDefined();
  });
});


