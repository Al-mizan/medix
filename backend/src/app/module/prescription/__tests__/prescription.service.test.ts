import { describe, it, expect, vi, beforeEach } from 'vitest';
import status from 'http-status';
import { Role } from '../../../../generated/prisma/enums';
import { uploadFileToCloudinary } from '../../../config/cloudinary.config';
import { sendEmail } from '../../../utils/email';
import { generatePrescriptionPDF } from '../prescription.utils';

const { mockDoctor, mockAppointment, mockPrescription } = vi.hoisted(() => ({
  mockDoctor: {
    findUniqueOrThrow: vi.fn(),
  },
  mockAppointment: {
    findUniqueOrThrow: vi.fn(),
  },
  mockPrescription: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    doctor: mockDoctor,
    appointment: mockAppointment,
    prescription: mockPrescription,
    $transaction: vi.fn(async (cb: (tx: {
      prescription: typeof mockPrescription;
    }) => Promise<unknown>) =>
      cb({
        prescription: mockPrescription,
      })
    ),
  },
}));

vi.mock('../../../config/cloudinary.config', () => ({
  uploadFileToCloudinary: vi.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/prescription.pdf' }),
  deleteFileFromCloudinary: vi.fn().mockResolvedValue({ result: 'ok' }),
}));

vi.mock('../../../utils/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('../prescription.utils', () => ({
  generatePrescriptionPDF: vi.fn().mockResolvedValue(Buffer.from('pdf-binary')),
}));

import { PrescriptionService } from '../prescription.service';
import AppError from '../../../errorHelpers/AppError';

describe('PrescriptionService', () => {
  const mockDoctorUser = {
    userId: 'user-doc-1',
    email: 'doctor@medix.com',
    role: Role.DOCTOR,
  };

  const mockDoctorData = {
    id: 'doc-123',
    name: 'Dr. Sarah Jenkins',
    email: 'doctor@medix.com',
  };

  const mockAppointmentData = {
    id: 'appt-456',
    doctorId: 'doc-123',
    patientId: 'pat-789',
    patient: {
      id: 'pat-789',
      name: 'John Doe',
      email: 'patient@example.com',
    },
    doctor: {
      id: 'doc-123',
      name: 'Dr. Sarah Jenkins',
      specialties: [{ specialty: { title: 'Cardiology' } }],
    },
    schedule: {
      startDateTime: new Date('2026-10-15T09:00:00Z'),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('givePrescription', () => {
    const payload = {
      appointmentId: 'appt-456',
      instructions: 'Take Amoxicillin 500mg three times daily for 7 days.',
      followUpDate: new Date('2026-10-30'),
    };

    it('should successfully create prescription, generate PDF, upload to Cloudinary, and send email', async () => {
      mockDoctor.findUniqueOrThrow.mockResolvedValue(mockDoctorData);
      mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);
      mockPrescription.findFirst.mockResolvedValue(null);

      const createdPrescription = {
        id: 'rx-001',
        ...payload,
        doctorId: 'doc-123',
        patientId: 'pat-789',
      };
      mockPrescription.create.mockResolvedValue(createdPrescription);

      const updatedPrescription = {
        ...createdPrescription,
        pdfUrl: 'https://cloudinary.com/prescription.pdf',
      };
      mockPrescription.update.mockResolvedValue(updatedPrescription);

      const result = await PrescriptionService.givePrescription(mockDoctorUser, payload);

      expect(mockDoctor.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { email: mockDoctorUser.email },
      });
      expect(mockAppointment.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: payload.appointmentId },
        include: expect.any(Object),
      });
      expect(mockPrescription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          appointmentId: payload.appointmentId,
          doctorId: 'doc-123',
          patientId: 'pat-789',
        }),
      });
      expect(generatePrescriptionPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          doctorName: mockDoctorData.name,
          patientName: mockAppointmentData.patient.name,
          instructions: payload.instructions,
        })
      );
      expect(uploadFileToCloudinary).toHaveBeenCalled();
      expect(mockPrescription.update).toHaveBeenCalledWith({
        where: { id: 'rx-001' },
        data: { pdfUrl: 'https://cloudinary.com/prescription.pdf' },
      });
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockAppointmentData.patient.email,
        })
      );
      expect(result).toEqual(updatedPrescription);
    });

    it('should throw BAD_REQUEST if doctor attempts to prescribe for another doctor appointment', async () => {
      mockDoctor.findUniqueOrThrow.mockResolvedValue(mockDoctorData);
      mockAppointment.findUniqueOrThrow.mockResolvedValue({
        ...mockAppointmentData,
        doctorId: 'different-doc-999',
      });

      await expect(
        PrescriptionService.givePrescription(mockDoctorUser, payload)
      ).rejects.toThrow(
        new AppError(status.BAD_REQUEST, 'You can only give prescription for your own appointments')
      );

      expect(mockPrescription.create).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST if prescription already exists for the appointment', async () => {
      mockDoctor.findUniqueOrThrow.mockResolvedValue(mockDoctorData);
      mockAppointment.findUniqueOrThrow.mockResolvedValue(mockAppointmentData);
      mockPrescription.findFirst.mockResolvedValue({ id: 'existing-rx' });

      await expect(
        PrescriptionService.givePrescription(mockDoctorUser, payload)
      ).rejects.toThrow(
        new AppError(
          status.BAD_REQUEST,
          'You have already given prescription for this appointment. You can update the prescription instead.'
        )
      );

      expect(mockPrescription.create).not.toHaveBeenCalled();
    });
  });
});
