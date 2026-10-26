import { Request, Response } from "express";
import httpStatus from "http-status";
import { IRequestUser } from "../../interface/requestUser.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const query = req.query;
    const result = await NotificationService.getMyNotifications(user, query);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Notifications retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const { id } = req.params;
    const result = await NotificationService.markAsRead(user, id as string);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Notification marked as read successfully",
        data: result,
    });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await NotificationService.markAllAsRead(user);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "All notifications marked as read successfully",
        data: result,
    });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const { id } = req.params;
    const result = await NotificationService.deleteNotification(user, id as string);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "Notification deleted successfully",
        data: result,
    });
});

export const NotificationController = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
