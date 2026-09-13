import { IAppointmentDoctor, IAppointmentPatient } from "./appointment.types";

export interface IMedicationItem {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface IPrescription {
    id: string;
    followUpDate: string | Date;
    instructions: string;
    pdfUrl?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    doctor?: IAppointmentDoctor | null;
    patient?: (IAppointmentPatient & { contactNumber?: string; address?: string }) | null;
    appointment?: {
        id: string;
        status: string;
        paymentStatus: string;
        createdAt?: string | Date;
        schedule?: {
            startDateTime?: string | Date;
            endDateTime?: string | Date;
        } | null;
    } | null;
}

export interface ICreatePrescriptionPayload {
    appointmentId: string;
    instructions: string;
    followUpDate?: string;
}

export interface IUpdatePrescriptionPayload {
    instructions?: string;
    followUpDate?: string;
}

