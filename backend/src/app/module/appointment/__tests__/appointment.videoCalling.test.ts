import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentStatus, PaymentStatus, Role } from '../../../../generated/prisma/enums';
import AppError from '../../../errorHelpers/AppError';

const { mockAppointment } = vi.hoisted(() => ({
  mockAppointment: {
    findUniqueOrThrow: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    appointment: mockAppointment,
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

import { AppointmentService } from '../appointment.service';

describe('AppointmentService.getAppointmentByVideoCallingId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAppointmentData = {
    id: 'apt-123',
    videoCallingId: 'vc-123-uuid',
    doctorId: 'doc-1',
    patientId: 'pat-1',
    status: AppointmentStatus.INPROGRESS,
    paymentStatus: PaymentStatus.PAID,
    doctor: {
      id: 'doc-1',
      name: 'Dr. Smith',
      email: 'doctor@example.com',
      userId: 'user-doc-1',
    },
    patient: {
      id: 'pat-1',
      name: 'John Doe',
      email: 'patient@example.com',
      userId: 'user-pat-1',
    },
  };

  it('should return appointment for authorized doctor', async () => {
    mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);

    const result = await AppointmentService.getAppointmentByVideoCallingId('vc-123-uuid', {
      userId: 'user-doc-1',
      email: 'doctor@example.com',
      role: Role.DOCTOR,
    });

    expect(result).toEqual(mockAppointmentData);
    expect(mockAppointment.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { videoCallingId: 'vc-123-uuid' },
      })
    );
  });

  it('should return appointment for authorized patient', async () => {
    mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);

    const result = await AppointmentService.getAppointmentByVideoCallingId('vc-123-uuid', {
      userId: 'user-pat-1',
      email: 'patient@example.com',
      role: Role.PATIENT,
    });

    expect(result).toEqual(mockAppointmentData);
  });

  it('should return appointment for admin', async () => {
    mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);

    const result = await AppointmentService.getAppointmentByVideoCallingId('vc-123-uuid', {
      userId: 'admin-1',
      email: 'admin@example.com',
      role: Role.ADMIN,
    });

    expect(result).toEqual(mockAppointmentData);
  });

  it('should reject unauthorized doctor', async () => {
    mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);

    await expect(
      AppointmentService.getAppointmentByVideoCallingId('vc-123-uuid', {
        userId: 'other-doc',
        email: 'otherdoc@example.com',
        role: Role.DOCTOR,
      })
    ).rejects.toThrow(AppError);
  });

  it('should reject unauthorized patient', async () => {
    mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);

    await expect(
      AppointmentService.getAppointmentByVideoCallingId('vc-123-uuid', {
        userId: 'other-patient',
        email: 'otherpatient@example.com',
        role: Role.PATIENT,
      })
    ).rejects.toThrow(AppError);
  });
});
