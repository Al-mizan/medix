export type NotificationType = "APPOINTMENT" | "SCHEDULE" | "PRESCRIPTION" | "SYSTEM" | "USER";

export interface INotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    actionUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface INotificationMeta {
    page: number;
    limit: number;
    total: number;
    unreadCount: number;
    totalPages: number;
}

export interface INotificationResponse {
    success: boolean;
    message: string;
    meta?: INotificationMeta;
    data: INotification[];
}
