import { IAppointment } from "./appointment.types";

export interface IReviewPatient {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
}

export interface IReviewDoctor {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
}

export interface IReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patient?: IReviewPatient;
  doctor?: IReviewDoctor;
  appointment?: IAppointment;
}
