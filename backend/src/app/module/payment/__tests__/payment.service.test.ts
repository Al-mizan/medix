import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentStatus, PaymentStatus } from '../../../../generated/prisma/enums';
import { uploadFileToCloudinary } from '../../../config/cloudinary.config';
import { sendEmail } from '../../../utils/email';

const { mockPayment, mockAppointment, mockDoctorSchedules } = vi.hoisted(() => ({
  mockPayment: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  mockAppointment: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  mockDoctorSchedules: {
    update: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    payment: mockPayment,
    appointment: mockAppointment,
    doctorSchedules: mockDoctorSchedules,
    $transaction: vi.fn(async (cb: (tx: {
      payment: typeof mockPayment;
      appointment: typeof mockAppointment;
      doctorSchedules: typeof mockDoctorSchedules;
    }) => Promise<unknown>) =>
      cb({
        payment: mockPayment,
        appointment: mockAppointment,
        doctorSchedules: mockDoctorSchedules,
      })
    ),
  },
}));

vi.mock('../../../config/stripe.config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock('../payment.utils', () => ({
  generateInvoicePdf: vi.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
}));

vi.mock('../../../config/cloudinary.config', () => ({
  uploadFileToCloudinary: vi.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/invoice.pdf' }),
}));

vi.mock('../../../utils/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

import { PaymentService } from '../payment.service';

type StripeWebhookEvent = Parameters<typeof PaymentService.handlerStripeWebhookEvent>[0];

describe('PaymentService Webhook and Query Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkout.session.completed', () => {
    it('should mark payment and appointment as PAID, upload invoice PDF, and dispatch confirmation email', async () => {
      mockPayment.findFirst.mockResolvedValue(null);

      const mockAppt = {
        id: 'appt-123',
        doctorId: 'doc-456',
        scheduleId: 'sch-789',
        status: AppointmentStatus.SCHEDULED,
        paymentStatus: PaymentStatus.UNPAID,
        patient: {
          id: 'pat-101',
          name: 'John Doe',
          email: 'john@example.com',
        },
        doctor: {
          id: 'doc-456',
          name: 'Dr. Sarah Jenkins',
        },
        schedule: {
          startDateTime: new Date('2026-10-01T10:00:00Z'),
        },
        payment: {
          id: 'pay-001',
          amount: 100,
          transactionId: 'pi_test_123',
          status: PaymentStatus.UNPAID,
        },
      };
      mockAppointment.findUnique.mockResolvedValue(mockAppt);
      mockAppointment.update.mockResolvedValue({ ...mockAppt, paymentStatus: PaymentStatus.PAID });
      mockPayment.update.mockResolvedValue({ ...mockAppt.payment, status: PaymentStatus.PAID });

      const event = {
        id: 'evt_stripe_completed_1',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_completed_123',
            payment_status: 'paid',
            metadata: {
              appointmentId: 'appt-123',
              paymentId: 'pay-001',
            },
          },
        },
      };

      const result = await PaymentService.handlerStripeWebhookEvent(event as unknown as StripeWebhookEvent);

      expect(mockAppointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        include: {
          patient: true,
          doctor: true,
          schedule: true,
          payment: true,
        },
      });

      expect(mockAppointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      });

      expect(mockPayment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-001' },
          data: expect.objectContaining({
            status: PaymentStatus.PAID,
            stripeEventId: 'evt_stripe_completed_1',
            invoiceUrl: 'https://cloudinary.com/invoice.pdf',
          }),
        })
      );

      expect(uploadFileToCloudinary).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          templateName: 'invoice',
        })
      );

      expect(result).toEqual({ message: 'Webhook Event evt_stripe_completed_1 processed successfully' });
    });

    it('should return missing metadata message if metadata is absent', async () => {
      mockPayment.findFirst.mockResolvedValue(null);

      const event = {
        id: 'evt_missing_meta',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_no_meta',
            metadata: {},
          },
        },
      };

      const result = await PaymentService.handlerStripeWebhookEvent(event as unknown as StripeWebhookEvent);

      expect(result).toEqual({ message: 'Missing metadata' });
      expect(mockAppointment.findUnique).not.toHaveBeenCalled();
    });

    it('should return appointment not found message if appointment does not exist in DB', async () => {
      mockPayment.findFirst.mockResolvedValue(null);
      mockAppointment.findUnique.mockResolvedValue(null);

      const event = {
        id: 'evt_no_appt',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_no_appt',
            payment_status: 'paid',
            metadata: {
              appointmentId: 'appt-nonexistent',
              paymentId: 'pay-999',
            },
          },
        },
      };

      const result = await PaymentService.handlerStripeWebhookEvent(event as unknown as StripeWebhookEvent);

      expect(result).toEqual({ message: 'Appointment not found' });
    });
  });

  describe('checkout.session.expired', () => {
    it('should mark payment as FAILED, appointment as CANCELED, and free doctor schedule slot', async () => {
      mockPayment.findFirst.mockResolvedValue(null);

      const mockAppt = {
        id: 'appt-123',
        doctorId: 'doc-456',
        scheduleId: 'sch-789',
        status: AppointmentStatus.SCHEDULED,
        paymentStatus: PaymentStatus.UNPAID,
        payment: {
          id: 'pay-001',
          status: PaymentStatus.UNPAID,
        },
      };
      mockAppointment.findUnique.mockResolvedValue(mockAppt);

      const event = {
        id: 'evt_stripe_expired_1',
        type: 'checkout.session.expired',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {
              appointmentId: 'appt-123',
              paymentId: 'pay-001',
            },
          },
        },
      };

      const result = await PaymentService.handlerStripeWebhookEvent(event as unknown as StripeWebhookEvent);

      expect(mockAppointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        include: { payment: true },
      });

      expect(mockPayment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-001' },
          data: expect.objectContaining({
            status: PaymentStatus.FAILED,
            stripeEventId: 'evt_stripe_expired_1',
          }),
        })
      );

      expect(mockAppointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'appt-123' },
          data: expect.objectContaining({
            status: AppointmentStatus.CANCELED,
            paymentStatus: PaymentStatus.FAILED,
          }),
        })
      );

      expect(mockDoctorSchedules.update).toHaveBeenCalledWith({
        where: {
          doctorId_scheduleId: {
            doctorId: 'doc-456',
            scheduleId: 'sch-789',
          },
        },
        data: {
          isBooked: false,
        },
      });

      expect(result).toEqual({ message: 'Webhook Event evt_stripe_expired_1 processed successfully' });
    });
  });

  describe('payment_intent.payment_failed', () => {
    it('should mark payment as FAILED, cancel appointment, and free doctor schedule slot', async () => {
      mockPayment.findFirst.mockResolvedValue(null);

      const mockAppt = {
        id: 'appt-failed-123',
        doctorId: 'doc-fail',
        scheduleId: 'sch-fail',
        status: AppointmentStatus.SCHEDULED,
        paymentStatus: PaymentStatus.UNPAID,
        payment: {
          id: 'pay-fail-001',
          status: PaymentStatus.UNPAID,
        },
      };
      mockAppointment.findUnique.mockResolvedValue(mockAppt);

      const event = {
        id: 'evt_stripe_failed_1',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_failed_123',
            metadata: {
              appointmentId: 'appt-failed-123',
              paymentId: 'pay-fail-001',
            },
          },
        },
      };

      const result = await PaymentService.handlerStripeWebhookEvent(event as unknown as StripeWebhookEvent);

      expect(mockAppointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'appt-failed-123' },
        include: { payment: true },
      });

      expect(mockPayment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-fail-001' },
          data: expect.objectContaining({
            status: PaymentStatus.FAILED,
            stripeEventId: 'evt_stripe_failed_1',
          }),
        })
      );

      expect(mockAppointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'appt-failed-123' },
          data: expect.objectContaining({
            status: AppointmentStatus.CANCELED,
            paymentStatus: PaymentStatus.FAILED,
          }),
        })
      );

      expect(mockDoctorSchedules.update).toHaveBeenCalledWith({
        where: {
          doctorId_scheduleId: {
            doctorId: 'doc-fail',
            scheduleId: 'sch-fail',
          },
        },
        data: {
          isBooked: false,
        },
      });

      expect(result).toEqual({ message: 'Webhook Event evt_stripe_failed_1 processed successfully' });
    });
  });

  describe('idempotency', () => {
    it('should skip duplicate stripe webhook events', async () => {
      mockPayment.findFirst.mockResolvedValue({
        id: 'existing-payment-1',
        stripeEventId: 'evt_already_done',
      });

      const event = {
        id: 'evt_already_done',
        type: 'checkout.session.completed',
        data: { object: {} },
      };

      const result = await PaymentService.handlerStripeWebhookEvent(event as unknown as StripeWebhookEvent);

      expect(result).toEqual({ message: 'Event evt_already_done already processed. Skipping' });
      expect(mockAppointment.findUnique).not.toHaveBeenCalled();
    });
  });
});
