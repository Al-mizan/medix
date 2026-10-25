import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock stripe
const { mockStripeWebhooks } = vi.hoisted(() => ({
  mockStripeWebhooks: {
    constructEvent: vi.fn(),
  },
}));

vi.mock('../../src/app/config/stripe.config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhooks: mockStripeWebhooks,
  },
}));

// Mock cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(),
  },
}));

// Mock PaymentService
const { mockPaymentService } = vi.hoisted(() => ({
  mockPaymentService: {
    handlerStripeWebhookEvent: vi.fn(),
    getAllPayments: vi.fn(),
  },
}));

vi.mock('../../src/app/module/payment/payment.service', () => ({
  PaymentService: mockPaymentService,
}));

import app from '../../src/app';

describe('Stripe Webhook Integration Tests (POST /webhook)', () => {
  const mockWebhookPayload = JSON.stringify({
    id: 'evt_test_123',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_session_123',
        metadata: {
          appointmentId: 'apt_test_001',
          paymentId: 'pay_test_001',
        },
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects webhook with HTTP 400 when stripe-signature header is missing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .send(mockWebhookPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing stripe signature or webhook secret/i);
    expect(mockStripeWebhooks.constructEvent).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing Stripe signature'));
    errorSpy.mockRestore();
  });

  it('rejects webhook with HTTP 400 when signature construction fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockStripeWebhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature verification');
    });

    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=12345,v1=invalid_sig')
      .send(mockWebhookPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/error processing stripe webhook/i);
    expect(mockPaymentService.handlerStripeWebhookEvent).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error processing Stripe webhook'),
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });

  it('successfully processes valid checkout.session.completed event (HTTP 200)', async () => {
    const parsedEvent = JSON.parse(mockWebhookPayload);
    mockStripeWebhooks.constructEvent.mockReturnValue(parsedEvent);
    mockPaymentService.handlerStripeWebhookEvent.mockResolvedValue({
      appointment: { id: 'apt_test_001', status: 'PAID' },
      payment: { id: 'pay_test_001', status: 'PAID' },
    });

    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=12345,v1=valid_test_sig')
      .send(mockWebhookPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/stripe webhook event processed successfully/i);
    expect(mockPaymentService.handlerStripeWebhookEvent).toHaveBeenCalledWith(parsedEvent);
  });

  it('idempotently handles already processed duplicate events (HTTP 200)', async () => {
    const parsedEvent = JSON.parse(mockWebhookPayload);
    mockStripeWebhooks.constructEvent.mockReturnValue(parsedEvent);
    mockPaymentService.handlerStripeWebhookEvent.mockResolvedValue({
      message: 'Event evt_test_123 already processed. Skipping',
    });

    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=12345,v1=valid_test_sig')
      .send(mockWebhookPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/already processed/i);
  });

  it('returns HTTP 500 when event processing throws an unexpected error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const parsedEvent = JSON.parse(mockWebhookPayload);
    mockStripeWebhooks.constructEvent.mockReturnValue(parsedEvent);
    mockPaymentService.handlerStripeWebhookEvent.mockRejectedValue(
      new Error('Database transaction deadlocked')
    );

    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=12345,v1=valid_test_sig')
      .send(mockWebhookPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/error handling stripe webhook event/i);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error handling Stripe webhook event'),
      expect.any(Error)
    );
    errorSpy.mockRestore();
  });
});
