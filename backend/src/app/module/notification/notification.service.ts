import status from "http-status";
import { NotificationType } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateNotificationPayload, INotificationFilterParams } from "./notification.interface";

const createNotification = async (payload: ICreateNotificationPayload) => {
    if (!prisma?.notification?.create) {
        return null;
    }
    return await prisma.notification.create({
        data: {
            userId: payload.userId,
            title: payload.title,
            message: payload.message,
            type: payload.type || NotificationType.SYSTEM,
            actionUrl: payload.actionUrl,
        },
    });
};

const getMyNotifications = async (user: IRequestUser, query?: INotificationFilterParams) => {
    const page = Math.max(1, Number(query?.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query?.limit || 20)));
    const skip = (page - 1) * limit;

    const whereConditions: {
        userId: string;
        read?: boolean;
        type?: NotificationType;
    } = {
        userId: user.userId,
    };

    if (query?.read !== undefined) {
        whereConditions.read = query.read === "true" || query.read === true;
    }

    if (query?.type) {
        whereConditions.type = query.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where: whereConditions,
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.notification.count({
            where: whereConditions,
        }),
        prisma.notification.count({
            where: {
                userId: user.userId,
                read: false,
            },
        }),
    ]);

    return {
        meta: {
            page,
            limit,
            total,
            unreadCount,
            totalPages: Math.ceil(total / limit),
        },
        data: notifications,
    };
};

const markAsRead = async (user: IRequestUser, id: string) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id,
            userId: user.userId,
        },
    });

    if (!notification) {
        throw new AppError(status.NOT_FOUND, "Notification not found");
    }

    return await prisma.notification.update({
        where: { id },
        data: { read: true },
    });
};

const markAllAsRead = async (user: IRequestUser) => {
    const result = await prisma.notification.updateMany({
        where: {
            userId: user.userId,
            read: false,
        },
        data: {
            read: true,
        },
    });

    return {
        count: result.count,
    };
};

const deleteNotification = async (user: IRequestUser, id: string) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id,
            userId: user.userId,
        },
    });

    if (!notification) {
        throw new AppError(status.NOT_FOUND, "Notification not found");
    }

    return await prisma.notification.delete({
        where: { id },
    });
};

export const NotificationService = {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
