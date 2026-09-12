import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentStatus, Role } from '../../../../generated/prisma/enums';
import AppError from '../../../errorHelpers/AppError';

// Hoist mock objects so they are initialized when vi.mock is hoisted
const { mockAppointment, mockDoctorSchedules } = vi.hoisted(() => ({
  mockAppointment: {
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  mockDoctorSchedules: {
    update: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    appointment: mockAppointment,
    doctorSchedules: mockDoctorSchedules,
    $transaction: vi.fn(async (cb: (tx: { appointment: typeof mockAppointment; doctorSchedules: typeof mockDoctorSchedules }) => Promise<unknown>) =>
      cb({
        appointment: mockAppointment,
        doctorSchedules: mockDoctorSchedules,
      })
    ),
  },
}));

// Mock stripe to avoid external initialization
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

describe('AppointmentService.changeAppointmentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseAppointment = {
    id: 'apt-123',
    doctorId: 'doc-1',
    patientId: 'pat-1',
    scheduleId: 'sch-1',
    status: AppointmentStatus.SCHEDULED,
    patient: {
      email: 'patient@example.com',
    },
    doctor: {
      email: 'doctor@example.com',
    },
  };

  describe('Patient State Transitions', () => {
    const patientUser = {
      userId: 'user-pat-1',
      email: 'patient@example.com',
      role: Role.PATIENT,
    };

    it('should allow patient to cancel their own SCHEDULED appointment and free doctor schedule', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue(baseAppointment);
      mockAppointment.update.mockResolvedValue({
        ...baseAppointment,
        status: AppointmentStatus.CANCELED,
      });
      mockDoctorSchedules.update.mockResolvedValue({
        doctorId: 'doc-1',
        scheduleId: 'sch-1',
        isBooked: false,
      });

      const result = await AppointmentService.changeAppointmentStatus(
        'apt-123',
        AppointmentStatus.CANCELED,
        patientUser
      );

      expect(mockAppointment.update).toHaveBeenCalledWith({
        where: { id: 'apt-123' },
        data: { status: AppointmentStatus.CANCELED },
      });
      expect(mockDoctorSchedules.update).toHaveBeenCalledWith({
        where: {
          doctorId_scheduleId: {
            doctorId: 'doc-1',
            scheduleId: 'sch-1',
          },
        },
        data: { isBooked: false },
      });
      expect(result.status).toBe(AppointmentStatus.CANCELED);
    });

    it('should reject patient attempting to set status other than CANCELED', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue(baseAppointment);

      await expect(
        AppointmentService.changeAppointmentStatus(
          'apt-123',
          AppointmentStatus.INPROGRESS,
          patientUser
        )
      ).rejects.toThrow(AppError);
    });

    it('should reject patient attempting to cancel another patient\'s appointment', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue(baseAppointment);

      const unauthorizedPatient = {
        userId: 'other-pat',
        email: 'other@example.com',
        role: Role.PATIENT,
      };

      await expect(
        AppointmentService.changeAppointmentStatus(
          'apt-123',
          AppointmentStatus.CANCELED,
          unauthorizedPatient
        )
      ).rejects.toThrow(/own appointments/i);
    });

    it('should reject patient attempting to cancel an INPROGRESS appointment', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        ...baseAppointment,
        status: AppointmentStatus.INPROGRESS,
      });

      await expect(
        AppointmentService.changeAppointmentStatus(
          'apt-123',
          AppointmentStatus.CANCELED,
          patientUser
        )
      ).rejects.toThrow(/only be canceled while in SCHEDULED status/i);
    });
  });

  describe('Doctor State Transitions', () => {
    const doctorUser = {
      userId: 'user-doc-1',
      email: 'doctor@example.com',
      role: Role.DOCTOR,
    };

    it('should allow doctor to transition SCHEDULED to INPROGRESS', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue(baseAppointment);
      mockAppointment.update.mockResolvedValue({
        ...baseAppointment,
        status: AppointmentStatus.INPROGRESS,
      });

      const result = await AppointmentService.changeAppointmentStatus(
        'apt-123',
        AppointmentStatus.INPROGRESS,
        doctorUser
      );

      expect(mockAppointment.update).toHaveBeenCalledWith({
        where: { id: 'apt-123' },
        data: { status: AppointmentStatus.INPROGRESS },
      });
      expect(result.status).toBe(AppointmentStatus.INPROGRESS);
    });

    it('should allow doctor to transition INPROGRESS to COMPLETED', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        ...baseAppointment,
        status: AppointmentStatus.INPROGRESS,
      });
      mockAppointment.update.mockResolvedValue({
        ...baseAppointment,
        status: AppointmentStatus.COMPLETED,
      });

      const result = await AppointmentService.changeAppointmentStatus(
        'apt-123',
        AppointmentStatus.COMPLETED,
        doctorUser
      );

      expect(mockAppointment.update).toHaveBeenCalledWith({
        where: { id: 'apt-123' },
        data: { status: AppointmentStatus.COMPLETED },
      });
      expect(result.status).toBe(AppointmentStatus.COMPLETED);
    });

    it('should reject doctor skipping from SCHEDULED directly to COMPLETED', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue(baseAppointment);

      await expect(
        AppointmentService.changeAppointmentStatus(
          'apt-123',
          AppointmentStatus.COMPLETED,
          doctorUser
        )
      ).rejects.toThrow(/Doctors can only transition/i);
    });

    it('should reject doctor attempting to modify another doctor\'s appointment', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue(baseAppointment);

      const otherDoctor = {
        userId: 'other-doc',
        email: 'otherdoctor@example.com',
        role: Role.DOCTOR,
      };

      await expect(
        AppointmentService.changeAppointmentStatus(
          'apt-123',
          AppointmentStatus.INPROGRESS,
          otherDoctor
        )
      ).rejects.toThrow(/not your appointment/i);
    });
  });

  describe('Terminal Status Protection', () => {
    it('should reject updating an already COMPLETED appointment', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        ...baseAppointment,
        status: AppointmentStatus.COMPLETED,
      });

      const adminUser = {
        userId: 'admin-1',
        email: 'admin@medix.com',
        role: Role.ADMIN,
      };

      await expect(
        AppointmentService.changeAppointmentStatus(
          'apt-123',
          AppointmentStatus.CANCELED,
          adminUser
        )
      ).rejects.toThrow(/Completed appointments cannot be updated/i);
    });

    it('should reject updating an already CANCELED appointment', async () => {
      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        ...baseAppointment,
        status: AppointmentStatus.CANCELED,
      });

      const adminUser = {
        userId: 'admin-1',
        email: 'admin@medix.com',
        role: Role.ADMIN,
      };

      await expect(
        AppointmentService.changeAppointmentStatus(
          'apt-123',
          AppointmentStatus.INPROGRESS,
          adminUser
        )
      ).rejects.toThrow(/Canceled appointments cannot be updated/i);
    });
  });
});
