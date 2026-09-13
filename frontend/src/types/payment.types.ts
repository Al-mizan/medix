import { type IAppointment, type PaymentStatus } from "./appointment.types";
import { type IDoctor } from "./doctor.types";
import { type IPatient } from "./patient.types";
import { type ISchedule } from "./schedule.types";

export interface IPaymentAppointment extends Omit<Partial<IAppointment>, "doctor"> {
    id: string;
    patient?: IPatient;
    doctor?: IDoctor;
    schedule?: ISchedule;
}

export interface IPayment {
    id: string;
    amount: number;
    transactionId: string;
    stripeEventId?: string | null;
    status: PaymentStatus;
    paymentGatewayData?: Record<string, unknown> | null;
    invoiceUrl?: string | null;
    appointmentId: string;
    appointment?: IPaymentAppointment;
    doctor?: IDoctor;
    patient?: IPatient;
    schedule?: ISchedule;
    createdAt: string | Date;
    updatedAt: string | Date;
}
