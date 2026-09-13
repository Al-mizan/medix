import status from "http-status";
// import { uuidv7 } from "zod/mini";
import { v7 as uuidv7 } from "uuid";
import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import { Appointment, Prisma } from "../../../generated/prisma/client";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { IRequestUser } from "../../interface/requestUser.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IqueryParams } from "../../interface/query.interface";
import { appointmentFilterableFields, appointmentIncludeConfig, appointmentSearchableFields } from "./appointment.constant";

// Pay Now Book Appointment
const bookAppointment = async (payload: IBookAppointmentPayload, user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false,
        }
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where: {
            id: payload.scheduleId,
        }
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleData.id,
            }
        }
    });

    const videoCallingId = String(uuidv7());

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                doctorId: payload.doctorId,
                patientId: patientData.id,
                scheduleId: doctorSchedule.scheduleId,
                videoCallingId,
            }
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                }
            },
            data: {
                isBooked: true,
            }
        });

        const transactionId = String(uuidv7());

        const paymentData = await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: envVars.PAYMENT_CURRENCY,
                        product_data: {
                            name: `Appointment with Dr. ${doctorData.name}`,
                        },
                        unit_amount: doctorData.appointmentFee * 100,
                    },
                    quantity: 1,
                }
            ],
            metadata: {
                appointmentId: appointmentData.id,
                paymentId: paymentData.id,
            },

            success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,

            // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
            cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
        })

        return {
            appointmentData,
            paymentData,
            paymentUrl: session.url,
        };
    });

    return {
        appointment: result.appointmentData,
        payment: result.paymentData,
        paymentUrl: result.paymentUrl,
    };
}

const getMyAppointments = async (user: IRequestUser) => {
    //user can be patient or doctor, so we need to check both
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointments;

    if (patientData) {
        appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true,
                payment: true,
                prescription: true,
                review: true,
            }
        });
    } else if (doctorData) {
        appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                schedule: true,
                payment: true,
                prescription: true,
                review: true,
            }
        });
    } else {
        throw new Error("User not found");
    }

    return appointments;

}

/**
 * Enforces role-based state machine transitions on appointment statuses.
 * - Patients can only transition their own appointments from SCHEDULED to CANCELED (freeing doctor slot).
 * - Doctors can only advance their own appointments SCHEDULED -> INPROGRESS -> COMPLETED.
 * - Administrators can perform any status update.
 * - Terminal statuses (COMPLETED, CANCELED) cannot be updated.
 *
 * @param appointmentId - Unique ID of the target appointment
 * @param appointmentStatus - Requested target status
 * @param user - Authenticated user identity and role
 * @returns Promise resolving to the updated Appointment record
 * @throws {AppError} 400 on invalid status or forbidden state machine transitions
 * @throws {AppError} 403 when user modifies an appointment they do not own
 */
const changeAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus | { status: AppointmentStatus }, user: IRequestUser) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true,
            patient: true,
        }
    });

    const newStatus = typeof appointmentStatus === 'string' ? appointmentStatus : appointmentStatus.status;

    if (!newStatus || !Object.values(AppointmentStatus).includes(newStatus)) {
        throw new AppError(status.BAD_REQUEST, `Invalid appointment status: ${newStatus}`);
    }

    if (appointmentData.status === AppointmentStatus.COMPLETED) {
        throw new AppError(status.BAD_REQUEST, "Completed appointments cannot be updated");
    }

    if (appointmentData.status === AppointmentStatus.CANCELED) {
        throw new AppError(status.BAD_REQUEST, "Canceled appointments cannot be updated");
    }

    if (user?.role === Role.PATIENT) {
        if (user?.email !== appointmentData.patient.email) {
            throw new AppError(status.FORBIDDEN, "You can only cancel your own appointments");
        }

        if (newStatus !== AppointmentStatus.CANCELED) {
            throw new AppError(status.BAD_REQUEST, "Patients are only allowed to cancel appointments");
        }

        if (appointmentData.status !== AppointmentStatus.SCHEDULED) {
            throw new AppError(status.BAD_REQUEST, "Appointments can only be canceled while in SCHEDULED status");
        }
    } else if (user?.role === Role.DOCTOR) {
        if (user?.email !== appointmentData.doctor.email) {
            throw new AppError(status.FORBIDDEN, "This is not your appointment");
        }

        const isValidDoctorTransition =
            (appointmentData.status === AppointmentStatus.SCHEDULED && newStatus === AppointmentStatus.INPROGRESS) ||
            (appointmentData.status === AppointmentStatus.INPROGRESS && newStatus === AppointmentStatus.COMPLETED);

        if (!isValidDoctorTransition) {
            throw new AppError(
                status.BAD_REQUEST,
                `Doctors can only transition appointments from SCHEDULED to INPROGRESS, or INPROGRESS to COMPLETED. Current status: ${appointmentData.status}, Requested status: ${newStatus}`
            );
        }
    } else if (user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN) {
        // Admins and Super Admins can update to any valid status
    } else {
        throw new AppError(status.FORBIDDEN, "You are not authorized to update appointment status");
    }

    const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.appointment.update({
            where: {
                id: appointmentId,
            },
            data: {
                status: newStatus,
            }
        });

        if (newStatus === AppointmentStatus.CANCELED) {
            await tx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: appointmentData.doctorId,
                        scheduleId: appointmentData.scheduleId,
                    }
                },
                data: {
                    isBooked: false,
                }
            });
        }

        return updated;
    });

    return result;
}

const getMySingleAppointment = async (appointmentId: string, user: IRequestUser) => {
    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            ...(user.role === Role.DOCTOR
                ? { doctor: { email: user.email } }
                : { patient: { email: user.email } }),
        },
        include: {
            doctor: true,
            patient: true,
            schedule: true,
            payment: true,
            prescription: true,
            review: true,
        },
    });

    if (!appointment) {
        throw new AppError(status.NOT_FOUND, "Appointment not found");
    }

    return appointment;
};

const getAllAppointments = async (query: IqueryParams) => {
    const queryBuilder = new QueryBuilder<Appointment, Prisma.AppointmentWhereInput, Prisma.AppointmentInclude>(
        prisma.appointment,
        query,
        {
            searchableFields: appointmentSearchableFields,
            filterableFields: appointmentFilterableFields,
        }
    );

    const result = await queryBuilder
        .search()
        .filter()
        .include({
            doctor: true,
            patient: true,
            schedule: true,
        })
        .dynamicInclude(appointmentIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

    return result;
}

const bookAppointmentWithPayLater = async (payload: IBookAppointmentPayload, user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false,
        }
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where: {
            id: payload.scheduleId,
        }
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleData.id,
            }
        }
    });

    const videoCallingId = String(uuidv7());

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                doctorId: payload.doctorId,
                patientId: patientData.id,
                scheduleId: doctorSchedule.scheduleId,
                videoCallingId,
            }
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                }
            },
            data: {
                isBooked: true,
            }
        });

        const transactionId = String(uuidv7());

        const paymentData = await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId,
            }
        });

        return {
            appointment: appointmentData,
            payment: paymentData
        };

    });

    return result;
}

const initiatePayment = async (appointmentId: string, user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        }
    });

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
            patientId: patientData.id,
        },
        include: {
            doctor: true,
            payment: true,
        }
    });

    if (!appointmentData) {
        throw new AppError(status.NOT_FOUND, "Appointment not found");
    }

    if (!appointmentData.payment) {
        throw new AppError(status.NOT_FOUND, "Payment data not found for this appointment");
    }

    if (appointmentData.payment?.status === PaymentStatus.PAID) {
        throw new AppError(status.BAD_REQUEST, "Payment already completed for this appointment");
    };

    if (appointmentData.status === AppointmentStatus.CANCELED) {
        throw new AppError(status.BAD_REQUEST, "Appointment is canceled");
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: envVars.PAYMENT_CURRENCY,
                    product_data: {
                        name: `Appointment with Dr. ${appointmentData.doctor.name}`,
                    },
                    unit_amount: appointmentData.doctor.appointmentFee * 100,
                },
                quantity: 1,
            }
        ],
        metadata: {
            appointmentId: appointmentData.id,
            paymentId: appointmentData.payment.id,
        },

        success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointmentData.id}&payment_id=${appointmentData.payment.id}`,

        // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
        cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments?error=payment_cancelled`,
    })

    return {
        paymentUrl: session.url,
    }
}

const cancelUnpaidAppointments = async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unpaidAppointments = await prisma.appointment.findMany({
        where: {
            // status: AppointmentStatus.SCHEDULED,
            createdAt: {
                lte: thirtyMinutesAgo,
            },
            paymentStatus: PaymentStatus.UNPAID,
        },
    });

    const appointmentToCancel = unpaidAppointments.map(appointment => appointment.id);

    await prisma.$transaction(async (tx) => {

        await tx.appointment.updateMany({
            where: {
                id: {
                    in: appointmentToCancel,
                },
            },
            data: {
                status: AppointmentStatus.CANCELED,
            },
        });

        await tx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentToCancel,
                },
            },
        });

        for (const unpaidAppointment of unpaidAppointments) {
            await tx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unpaidAppointment.doctorId,
                        scheduleId: unpaidAppointment.scheduleId,
                    },
                },
                data: {
                    isBooked: false,
                },
            });
        }
    });
}

/**
 * Retrieves appointment details by videoCallingId.
 * Validates that the requesting user is the appointment's doctor, patient, or an admin.
 */
const getAppointmentByVideoCallingId = async (videoCallingId: string, user: IRequestUser) => {
    const appointment = await prisma.appointment.findUniqueOrThrow({
        where: {
            videoCallingId,
        },
        include: {
            doctor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    designation: true,
                    qualification: true,
                    userId: true,
                },
            },
            patient: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    userId: true,
                },
            },
            schedule: true,
            payment: true,
            prescription: true,
        },
    });

    if (user.role === Role.DOCTOR) {
        if (appointment.doctor.userId !== user.userId && appointment.doctor.email !== user.email) {
            throw new AppError(status.FORBIDDEN, "Unauthorized: You are not the doctor for this consultation.");
        }
    } else if (user.role === Role.PATIENT) {
        if (appointment.patient.userId !== user.userId && appointment.patient.email !== user.email) {
            throw new AppError(status.FORBIDDEN, "Unauthorized: You are not the patient for this consultation.");
        }
    }

    return appointment;
};

export const AppointmentService = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getMySingleAppointment,
    getAllAppointments,
    bookAppointmentWithPayLater,
    initiatePayment,
    cancelUnpaidAppointments,
    getAppointmentByVideoCallingId,
}