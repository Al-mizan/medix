import { NotificationType } from "../../../generated/prisma/enums";

export interface ICreateNotificationPayload {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    actionUrl?: string;
}

export interface INotificationFilterParams {
    read?: boolean | string;
    type?: NotificationType;
    page?: number | string;
    limit?: number | string;
}
