import { Prisma } from "../../../generated/prisma/client";

export const paymentSearchableFields = ["transactionId"];

export const paymentFilterableFields = ["status", "transactionId", "searchTerm"];

export const paymentIncludeConfig: Partial<Record<keyof Prisma.PaymentInclude, Prisma.PaymentInclude[keyof Prisma.PaymentInclude]>> = {
    appointment: {
        include: {
            patient: true,
            doctor: true,
            schedule: true,
        },
    },
};
