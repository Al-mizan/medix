import Stripe from "stripe";
import { AppointmentStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { Payment, Prisma } from "../../../generated/prisma/client";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { paymentFilterableFields, paymentIncludeConfig, paymentSearchableFields } from "./payment.constant";
import { generateInvoicePdf } from "./payment.utils";


const handlerStripeWebhookEvent = async (event: Stripe.Event) => {

    const existingPayment = await prisma.payment.findFirst({
        where: {
            stripeEventId: event.id
        }
    })

    if (existingPayment) {
        console.log(`Event ${event.id} already processed. Skipping`);
        return { message: `Event ${event.id} already processed. Skipping` }
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;

            if (!appointmentId || !paymentId) {
                console.error("⚠️ Missing metadata in webhook event");
                return { message: "Missing metadata" };
            }

            // Verify appointment exists with related data
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    patient: true,
                    doctor: true,
                    schedule: true,
                    payment: true
                }
            });

            if (!appointment) {
                console.error(`⚠️ Appointment ${appointmentId} not found. Payment may be for expired appointment.`);
                return { message: "Appointment not found" };
            }
            let pdfBuffer: Buffer | null = null;

            // Update both appointment and payment in a transaction
            const result = await prisma.$transaction(async (tx) => {
                const updatedAppointment = await tx.appointment.update({
                    where: {
                        id: appointmentId
                    },
                    data: {
                        paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                    }
                });

                let invoiceUrl = null;


                // If payment is successful, generate and upload invoice
                if (session.payment_status === "paid") {
                    try {
                        // Generate invoice PDF
                        pdfBuffer = await generateInvoicePdf({
                            invoiceId: appointment.payment?.id || paymentId,
                            patientName: appointment.patient.name,
                            patientEmail: appointment.patient.email,
                            doctorName: appointment.doctor.name,
                            appointmentDate: appointment.schedule.startDateTime.toString(),
                            amount: appointment.payment?.amount || 0,
                            transactionId: appointment.payment?.transactionId || "",
                            paymentDate: new Date().toISOString()
                        });

                        // Upload PDF to Cloudinary
                        const cloudinaryResponse = await uploadFileToCloudinary(
                            pdfBuffer,
                            `ph-healthcare/invoices/invoice-${paymentId}-${Date.now()}.pdf`
                        );

                        invoiceUrl = cloudinaryResponse?.secure_url;

                        console.log(`✅ Invoice PDF generated and uploaded for payment ${paymentId}`);
                    } catch (pdfError) {
                        console.error("❌ Error generating/uploading invoice PDF:", pdfError);
                        // Continue with payment update even if PDF generation fails
                    }
                }

                const updatedPayment = await tx.payment.update({
                    where: {
                        id: paymentId
                    },
                    data: {
                        status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        paymentGatewayData: session as unknown as Prisma.InputJsonValue,
                        invoiceUrl: invoiceUrl, // Store invoice URL
                        stripeEventId: event.id // Store event ID for idempotency
                    }
                });

                return { updatedAppointment, updatedPayment, invoiceUrl };
            });

            // Send invoice email to patient (outside transaction to avoid blocking payment update)
            if (session.payment_status === "paid" && result.invoiceUrl) {
                try {
                    await sendEmail({
                        to: appointment.patient.email,
                        subject: `Payment Confirmation & Invoice - Appointment with ${appointment.doctor.name}`,
                        templateName: "invoice",
                        templateData: {
                            patientName: appointment.patient.name,
                            invoiceId: appointment.payment?.id || paymentId,
                            transactionId: appointment.payment?.transactionId || "",
                            paymentDate: new Date().toLocaleDateString(),
                            doctorName: appointment.doctor.name,
                            appointmentDate: new Date(appointment.schedule.startDateTime).toLocaleDateString(),
                            amount: appointment.payment?.amount || 0,
                            invoiceUrl: result.invoiceUrl
                        },
                        attachments: [
                            {
                                filename: `Invoice-${paymentId}.pdf`,
                                content: pdfBuffer || Buffer.from(""), // Attach PDF if generated, else empty buffer
                                contentType: 'application/pdf'
                            }
                        ]
                    });

                    console.log(`✅ Invoice email sent to ${appointment.patient.email}`);
                } catch (emailError) {
                    console.error("❌ Error sending invoice email:", emailError);
                    // Log but don't fail the payment if email fails
                }
            }

            console.log(`✅ Payment ${session.payment_status} for appointment ${appointmentId}`);
            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;

            console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);

            if (!appointmentId) {
                console.error("⚠️ Missing appointmentId in expired checkout session metadata");
                return { message: "Missing appointmentId in metadata" };
            }

            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: { payment: true },
            });

            if (!appointment) {
                console.error(`⚠️ Appointment ${appointmentId} not found.`);
                return { message: "Appointment not found" };
            }

            await prisma.$transaction(async (tx) => {
                if (appointment.payment?.id || paymentId) {
                    await tx.payment.update({
                        where: { id: appointment.payment?.id || paymentId },
                        data: {
                            status: PaymentStatus.FAILED,
                            stripeEventId: event.id,
                            paymentGatewayData: session as unknown as Prisma.InputJsonValue,
                        },
                    });
                }

                await tx.appointment.update({
                    where: { id: appointment.id },
                    data: {
                        status: AppointmentStatus.CANCELED,
                        paymentStatus: PaymentStatus.FAILED,
                    },
                });

                await tx.doctorSchedules.update({
                    where: {
                        doctorId_scheduleId: {
                            doctorId: appointment.doctorId,
                            scheduleId: appointment.scheduleId,
                        },
                    },
                    data: {
                        isBooked: false,
                    },
                });
            });

            console.log(`✅ Canceled appointment ${appointmentId} and freed doctor schedule slot due to checkout session expiration.`);
            break;
        }

        case "payment_intent.payment_failed": {
            const session = event.data.object as Stripe.PaymentIntent;
            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;

            console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);

            let targetAppointmentId = appointmentId;

            if (!targetAppointmentId && paymentId) {
                const p = await prisma.payment.findUnique({
                    where: { id: paymentId },
                });
                if (p) {
                    targetAppointmentId = p.appointmentId;
                }
            }

            if (!targetAppointmentId) {
                console.error("⚠️ Missing appointmentId in payment_intent.payment_failed metadata");
                return { message: "Missing appointmentId in metadata" };
            }

            const appointment = await prisma.appointment.findUnique({
                where: { id: targetAppointmentId },
                include: { payment: true },
            });

            if (!appointment) {
                console.error(`⚠️ Appointment ${targetAppointmentId} not found.`);
                return { message: "Appointment not found" };
            }

            await prisma.$transaction(async (tx) => {
                if (appointment.payment?.id || paymentId) {
                    await tx.payment.update({
                        where: { id: appointment.payment?.id || paymentId },
                        data: {
                            status: PaymentStatus.FAILED,
                            stripeEventId: event.id,
                            paymentGatewayData: session as unknown as Prisma.InputJsonValue,
                        },
                    });
                }

                await tx.appointment.update({
                    where: { id: appointment.id },
                    data: {
                        status: AppointmentStatus.CANCELED,
                        paymentStatus: PaymentStatus.FAILED,
                    },
                });

                await tx.doctorSchedules.update({
                    where: {
                        doctorId_scheduleId: {
                            doctorId: appointment.doctorId,
                            scheduleId: appointment.scheduleId,
                        },
                    },
                    data: {
                        isBooked: false,
                    },
                });
            });

            console.log(`✅ Canceled appointment ${targetAppointmentId} and freed doctor schedule slot due to payment failure.`);
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` }
}

const getAllPayments = async (query: Record<string, unknown>) => {
    const queryBuilder = new QueryBuilder<Payment, Prisma.PaymentWhereInput, Prisma.PaymentInclude>(
        prisma.payment,
        query,
        {
            searchFields: paymentSearchableFields,
            searchableFields: paymentSearchableFields,
            filterableFields: paymentFilterableFields,
        }
    );

    const result = await queryBuilder
        .search()
        .filter()
        .include({
            appointment: {
                include: {
                    patient: true,
                    doctor: true,
                    schedule: true,
                },
            },
        })
        .dynamicInclude(paymentIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

    return result;
};

export const PaymentService = {
    handlerStripeWebhookEvent,
    getAllPayments,
}