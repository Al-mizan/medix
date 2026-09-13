import { z } from "zod";
import { PaymentStatus } from "../../../generated/prisma/enums";

const updatePaymentStatusZodSchema = z.object({
    body: z.object({
        status: z.enum([
            PaymentStatus.PAID,
            PaymentStatus.UNPAID,
            PaymentStatus.REFUNDED,
            PaymentStatus.FAILED,
        ]),
    }),
});

export const PaymentValidation = {
    updatePaymentStatusZodSchema,
};
