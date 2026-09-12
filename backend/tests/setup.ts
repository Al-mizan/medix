// Setup environment variables for testing environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/medix_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.BETTER_AUTH_SECRET = 'test-secret-at-least-32-characters-long-1234567890';
process.env.BETTER_AUTH_URL = 'http://localhost:5000';
process.env.ACCESS_TOKEN_SECRET = 'test-access-token-secret-1234567890';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-1234567890';
process.env.ACCESS_TOKEN_EXPIRES_IN = '1d';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN = '1d';
process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE = '1d';
process.env.EMAIL_SENDER_SMTP_USER = 'test@example.com';
process.env.EMAIL_SENDER_SMTP_PASS = 'password';
process.env.EMAIL_SENDER_SMTP_HOST = 'smtp.example.com';
process.env.EMAIL_SENDER_SMTP_PORT = '587';
process.env.EMAIL_SENDER_SMTP_FROM = 'noreply@example.com';
process.env.GOOGLE_CLIENT_ID = 'mock-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'mock-google-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5000/auth/google/callback';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.CLOUDINARY_CLOUD_NAME = 'mock-cloud';
process.env.CLOUDINARY_API_KEY = 'mock-api-key';
process.env.CLOUDINARY_API_SECRET = 'mock-api-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
process.env.SUPER_ADMIN_EMAIL = 'admin@medix.com';
process.env.SUPER_ADMIN_PASSWORD = 'Password123!';
process.env.PAYMENT_CURRENCY = 'bdt';

import { vi, beforeEach } from 'vitest';

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
