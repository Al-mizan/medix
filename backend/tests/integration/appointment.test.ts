import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { AppointmentStatus, Role, UserStatus } from '../../src/generated/prisma/enums';

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

// Hoist Prisma mock objects
const { mockSession, mockUser, mockAppointment, mockDoctorSchedules, mockPatient, mockDoctor, mockSchedule, mockPayment } = vi.hoisted(() => ({
  mockSession: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  mockUser: {
    findUnique: vi.fn(),
  },
  mockAppointment: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  mockDoctorSchedules: {
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  mockPatient: {
    findUniqueOrThrow: vi.fn(),
  },
  mockDoctor: {
    findUniqueOrThrow: vi.fn(),
  },
  mockSchedule: {
    findUniqueOrThrow: vi.fn(),
  },
  mockPayment: {
    create: vi.fn(),
  },
}));

vi.mock('../../src/app/lib/prisma', () => ({
  prisma: {
    session: mockSession,
    user: mockUser,
    appointment: mockAppointment,
    doctorSchedules: mockDoctorSchedules,
    patient: mockPatient,
    doctor: mockDoctor,
    schedule: mockSchedule,
    payment: mockPayment,
    $transaction: vi.fn(async (cb: (tx: {
      appointment: typeof mockAppointment;
      doctorSchedules: typeof mockDoctorSchedules;
      payment: typeof mockPayment;
    }) => Promise<unknown>) =>
      cb({
        appointment: mockAppointment,
        doctorSchedules: mockDoctorSchedules,
        payment: mockPayment,
      })
    ),
  },
}));

import app from '../../src/app';

describe('Appointment Integration Tests (supertest)', () => {
  const testSecret = process.env.ACCESS_TOKEN_SECRET || 'test-access-token-secret-1234567890';
  const sessionTokenPatient = 'session-token-patient-1';
  const sessionTokenDoctor = 'session-token-doctor-1';

  const patientUser = {
    id: 'user-pat-001',
    email: 'patient@medix.health',
    role: Role.PATIENT,
    status: UserStatus.ACTIVE,
    isDeleted: false,
    name: 'Patient Alice',
  };

  const doctorUser = {
    id: 'user-doc-001',
    email: 'doctor@medix.health',
    role: Role.DOCTOR,
    status: UserStatus.ACTIVE,
    isDeleted: false,
    name: 'Dr. Bob',
  };

  const patientToken = jwt.sign(
    { userId: patientUser.id, email: patientUser.email, role: patientUser.role },
    testSecret,
    { expiresIn: '1h' }
  );

  const doctorToken = jwt.sign(
    { userId: doctorUser.id, email: doctorUser.email, role: doctorUser.role },
    testSecret,
    { expiresIn: '1h' }
  );

  const validDoctorId = '018f3a3c-1b6e-7c2a-9e12-3456789abc01';
  const validScheduleId = '018f3a3c-1b6e-7c2a-9e12-3456789abc02';
  const validAppointmentId = '018f3a3c-1b6e-7c2a-9e12-3456789abc03';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/appointments/book-appointment-with-pay-later', () => {
    it('rejects booking when user is unauthenticated (HTTP 401)', async () => {
      const res = await request(app)
        .post('/api/v1/appointments/book-appointment-with-pay-later')
        .send({ doctorId: validDoctorId, scheduleId: validScheduleId });

      expect(res.status).toBe(401);
    });

    it('rejects booking when role is DOCTOR instead of PATIENT (HTTP 403)', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-doc',
        token: sessionTokenDoctor,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: doctorUser,
      });

      const res = await request(app)
        .post('/api/v1/appointments/book-appointment-with-pay-later')
        .set('Cookie', [
          `better-auth.session_token=${sessionTokenDoctor}`,
          `accessToken=${doctorToken}`,
        ])
        .send({ doctorId: validDoctorId, scheduleId: validScheduleId });

      expect(res.status).toBe(403);
    });

    it('rejects booking with invalid UUID format (HTTP 400)', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-pat',
        token: sessionTokenPatient,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: patientUser,
      });

      const res = await request(app)
        .post('/api/v1/appointments/book-appointment-with-pay-later')
        .set('Cookie', [
          `better-auth.session_token=${sessionTokenPatient}`,
          `accessToken=${patientToken}`,
        ])
        .send({ doctorId: 'non-uuid-string', scheduleId: validScheduleId });

      expect(res.status).toBe(400);
    });

    it('successfully books appointment with pay later for authenticated patient (HTTP 201)', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-pat',
        token: sessionTokenPatient,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: patientUser,
      });

      mockPatient.findUniqueOrThrow.mockResolvedValue({ id: 'pat-profile-1', email: patientUser.email });
      mockDoctor.findUniqueOrThrow.mockResolvedValue({ id: validDoctorId, isDeleted: false, appointmentFee: 500 });
      mockSchedule.findUniqueOrThrow.mockResolvedValue({ id: validScheduleId });
      mockDoctorSchedules.findUniqueOrThrow.mockResolvedValue({
        doctorId: validDoctorId,
        scheduleId: validScheduleId,
        isBooked: false,
      });

      const createdAppointment = {
        id: validAppointmentId,
        doctorId: validDoctorId,
        patientId: 'pat-profile-1',
        scheduleId: validScheduleId,
        status: AppointmentStatus.SCHEDULED,
      };

      mockAppointment.create.mockResolvedValue(createdAppointment);
      mockDoctorSchedules.update.mockResolvedValue({});
      mockPayment.create.mockResolvedValue({ id: 'pay-1', amount: 500 });

      const res = await request(app)
        .post('/api/v1/appointments/book-appointment-with-pay-later')
        .set('Cookie', [
          `better-auth.session_token=${sessionTokenPatient}`,
          `accessToken=${patientToken}`,
        ])
        .send({ doctorId: validDoctorId, scheduleId: validScheduleId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/appointment booked successfully/i);
      expect(res.body.data.appointment.status).toBe(AppointmentStatus.SCHEDULED);
    });
  });

  describe('PATCH /api/v1/appointments/change-appointment-status/:id', () => {
    it('allows doctor to transition status from SCHEDULED to INPROGRESS (HTTP 200)', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-doc',
        token: sessionTokenDoctor,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: doctorUser,
      });

      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        id: validAppointmentId,
        status: AppointmentStatus.SCHEDULED,
        doctorId: validDoctorId,
        scheduleId: validScheduleId,
        doctor: { email: doctorUser.email },
        patient: { email: patientUser.email },
      });

      mockAppointment.update.mockResolvedValue({
        id: validAppointmentId,
        status: AppointmentStatus.INPROGRESS,
      });

      const res = await request(app)
        .patch(`/api/v1/appointments/change-appointment-status/${validAppointmentId}`)
        .set('Cookie', [
          `better-auth.session_token=${sessionTokenDoctor}`,
          `accessToken=${doctorToken}`,
        ])
        .send({ status: AppointmentStatus.INPROGRESS });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(AppointmentStatus.INPROGRESS);
    });

    it('rejects invalid doctor transition from SCHEDULED directly to COMPLETED (HTTP 400)', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-doc',
        token: sessionTokenDoctor,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: doctorUser,
      });

      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        id: validAppointmentId,
        status: AppointmentStatus.SCHEDULED,
        doctorId: validDoctorId,
        scheduleId: validScheduleId,
        doctor: { email: doctorUser.email },
        patient: { email: patientUser.email },
      });

      const res = await request(app)
        .patch(`/api/v1/appointments/change-appointment-status/${validAppointmentId}`)
        .set('Cookie', [
          `better-auth.session_token=${sessionTokenDoctor}`,
          `accessToken=${doctorToken}`,
        ])
        .send({ status: AppointmentStatus.COMPLETED });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/doctors can only transition appointments/i);
    });

    it('allows patient to cancel their own appointment and frees doctor schedule (HTTP 200)', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-pat',
        token: sessionTokenPatient,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: patientUser,
      });

      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        id: validAppointmentId,
        status: AppointmentStatus.SCHEDULED,
        doctorId: validDoctorId,
        scheduleId: validScheduleId,
        doctor: { email: doctorUser.email },
        patient: { email: patientUser.email },
      });

      mockAppointment.update.mockResolvedValue({
        id: validAppointmentId,
        status: AppointmentStatus.CANCELED,
      });

      mockDoctorSchedules.update.mockResolvedValue({});

      const res = await request(app)
        .patch(`/api/v1/appointments/change-appointment-status/${validAppointmentId}`)
        .set('Cookie', [
          `better-auth.session_token=${sessionTokenPatient}`,
          `accessToken=${patientToken}`,
        ])
        .send({ status: AppointmentStatus.CANCELED });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(AppointmentStatus.CANCELED);

      // Verify schedule slot freed
      expect(mockDoctorSchedules.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isBooked: false },
        })
      );
    });

    it('rejects patient cancellation of another patient appointment (HTTP 403)', async () => {
      mockSession.findFirst.mockResolvedValue({
        id: 'sess-pat',
        token: sessionTokenPatient,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        user: patientUser,
      });

      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        id: validAppointmentId,
        status: AppointmentStatus.SCHEDULED,
        doctorId: validDoctorId,
        scheduleId: validScheduleId,
        doctor: { email: doctorUser.email },
        patient: { email: 'different-patient@medix.health' },
      });

      const res = await request(app)
        .patch(`/api/v1/appointments/change-appointment-status/${validAppointmentId}`)
        .set('Cookie', [
          `better-auth.session_token=${sessionTokenPatient}`,
          `accessToken=${patientToken}`,
        ])
        .send({ status: AppointmentStatus.CANCELED });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/only cancel your own appointments/i);
    });
  });
});
