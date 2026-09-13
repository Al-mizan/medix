import { PaymentStatus } from "../../../generated/prisma/enums";

export interface IPaymentFilterRequest {
    status?: PaymentStatus;
    transactionId?: string;
    searchTerm?: string;
}
