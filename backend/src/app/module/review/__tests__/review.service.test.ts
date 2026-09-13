import { describe, it, expect, vi, beforeEach } from 'vitest';
import status from 'http-status';
import { PaymentStatus, Role } from '../../../../generated/prisma/enums';

const { mockPatient, mockAppointment, mockDoctor, mockReview, mockUser } = vi.hoisted(() => ({
  mockPatient: {
    findUniqueOrThrow: vi.fn(),
  },
  mockAppointment: {
    findUniqueOrThrow: vi.fn(),
  },
  mockDoctor: {
    update: vi.fn(),
  },
  mockReview: {
    findFirst: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
    findMany: vi.fn(),
  },
  mockUser: {
    findUnique: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    patient: mockPatient,
    appointment: mockAppointment,
    doctor: mockDoctor,
    review: mockReview,
    user: mockUser,
    $transaction: vi.fn(async (cb: (tx: {
      review: typeof mockReview;
      doctor: typeof mockDoctor;
    }) => Promise<unknown>) =>
      cb({
        review: mockReview,
        doctor: mockDoctor,
      })
    ),
  },
}));

import { ReviewService } from '../review.service';
import AppError from '../../../errorHelpers/AppError';

describe('ReviewService Rating Calculation Atomicity', () => {
  const mockPatientUser = {
    userId: 'usr-pat-1',
    email: 'patient@example.com',
    role: Role.PATIENT,
  };

  const mockPatientData = {
    id: 'pat-123',
    email: 'patient@example.com',
    name: 'Jane Doe',
  };

  const mockAppointmentData = {
    id: 'appt-456',
    patientId: 'pat-123',
    doctorId: 'doc-789',
    paymentStatus: PaymentStatus.PAID,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('giveReview', () => {
    const payload = {
      appointmentId: 'appt-456',
      rating: 5,
      comment: 'Excellent doctor, very attentive.',
    };

    it('should create review and atomically update doctor average rating in a transaction', async () => {
      mockPatient.findUniqueOrThrow.mockResolvedValue(mockPatientData);
      mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);
      mockReview.findFirst.mockResolvedValue(null);

      const createdReview = {
        id: 'rev-001',
        ...payload,
        patientId: 'pat-123',
        doctorId: 'doc-789',
      };
      mockReview.create.mockResolvedValue(createdReview);
      mockReview.aggregate.mockResolvedValue({ _avg: { rating: 4.8 } });
      mockDoctor.update.mockResolvedValue({ id: 'doc-789', averageRating: 4.8 });

      const result = await ReviewService.giveReview(mockPatientUser, payload);

      expect(mockReview.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          patientId: 'pat-123',
          doctorId: 'doc-789',
        },
      });
      expect(mockReview.aggregate).toHaveBeenCalledWith({
        where: { doctorId: 'doc-789' },
        _avg: { rating: true },
      });
      expect(mockDoctor.update).toHaveBeenCalledWith({
        where: { id: 'doc-789' },
        data: { averageRating: 4.8 },
      });
      expect(result).toEqual(createdReview);
    });

    it('should throw BAD_REQUEST if appointment is not PAID', async () => {
      mockPatient.findUniqueOrThrow.mockResolvedValue(mockPatientData);
      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        ...mockAppointmentData,
        paymentStatus: PaymentStatus.UNPAID,
      });

      await expect(ReviewService.giveReview(mockPatientUser, payload)).rejects.toThrow(
        new AppError(status.BAD_REQUEST, 'You can only review after payment is done')
      );

      expect(mockReview.create).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST if patient tries to review someone elses appointment', async () => {
      mockPatient.findUniqueOrThrow.mockResolvedValue(mockPatientData);
      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        ...mockAppointmentData,
        patientId: 'other-pat-999',
      });

      await expect(ReviewService.giveReview(mockPatientUser, payload)).rejects.toThrow(
        new AppError(status.BAD_REQUEST, 'You can only review for your own appointments')
      );

      expect(mockReview.create).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST if appointment has already been reviewed', async () => {
      mockPatient.findUniqueOrThrow.mockResolvedValue(mockPatientData);
      mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);
      mockReview.findFirst.mockResolvedValue({ id: 'existing-rev' });

      await expect(ReviewService.giveReview(mockPatientUser, payload)).rejects.toThrow(
        new AppError(
          status.BAD_REQUEST,
          'You have already reviewed for this appointment. You can update your review instead.'
        )
      );

      expect(mockReview.create).not.toHaveBeenCalled();
    });
  });

  describe('updateReview', () => {
    it('should update review and atomically recompute doctor average rating', async () => {
      mockPatient.findUniqueOrThrow.mockResolvedValue(mockPatientData);
      mockReview.findUniqueOrThrow.mockResolvedValue({
        id: 'rev-001',
        patientId: 'pat-123',
        doctorId: 'doc-789',
        rating: 4,
      });

      const updatePayload = { rating: 5, comment: 'Updated review to 5 stars' };
      const updatedReview = {
        id: 'rev-001',
        patientId: 'pat-123',
        doctorId: 'doc-789',
        ...updatePayload,
      };

      mockReview.update.mockResolvedValue(updatedReview);
      mockReview.aggregate.mockResolvedValue({ _avg: { rating: 4.9 } });
      mockDoctor.update.mockResolvedValue({ id: 'doc-789', averageRating: 4.9 });

      const result = await ReviewService.updateReview(mockPatientUser, 'rev-001', updatePayload);

      expect(mockReview.update).toHaveBeenCalledWith({
        where: { id: 'rev-001' },
        data: updatePayload,
      });
      expect(mockReview.aggregate).toHaveBeenCalledWith({
        where: { doctorId: 'doc-789' },
        _avg: { rating: true },
      });
      expect(mockDoctor.update).toHaveBeenCalledWith({
        where: { id: 'doc-789' },
        data: { averageRating: 4.9 },
      });
      expect(result).toEqual(updatedReview);
    });
  });

  describe('deleteReview', () => {
    it('should delete review and atomically recompute doctor average rating', async () => {
      mockPatient.findUniqueOrThrow.mockResolvedValue(mockPatientData);
      mockReview.findUniqueOrThrow.mockResolvedValue({
        id: 'rev-001',
        patientId: 'pat-123',
        doctorId: 'doc-789',
      });

      const deletedReview = {
        id: 'rev-001',
        patientId: 'pat-123',
        doctorId: 'doc-789',
      };
      mockReview.delete.mockResolvedValue(deletedReview);
      mockReview.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });
      mockDoctor.update.mockResolvedValue({ id: 'doc-789', averageRating: 4.5 });

      const result = await ReviewService.deleteReview(mockPatientUser, 'rev-001');

      expect(mockReview.delete).toHaveBeenCalledWith({
        where: { id: 'rev-001' },
      });
      expect(mockReview.aggregate).toHaveBeenCalledWith({
        where: { doctorId: 'doc-789' },
        _avg: { rating: true },
      });
      expect(mockDoctor.update).toHaveBeenCalledWith({
        where: { id: 'doc-789' },
        data: { averageRating: 4.5 },
      });
      expect(result).toEqual(deletedReview);
    });
  });
});
