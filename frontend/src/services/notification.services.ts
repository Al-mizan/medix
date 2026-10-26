"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { INotification } from "@/types/notification.types";

export const getMyNotifications = async (
    params?: { read?: boolean; page?: number; limit?: number; type?: string }
): Promise<ApiResponse<INotification[]> | ApiErrorResponse> => {
    try {
        const searchParams = new URLSearchParams();
        if (params?.read !== undefined) {
            searchParams.set("read", String(params.read));
        }
        if (params?.page) {
            searchParams.set("page", String(params.page));
        }
        if (params?.limit) {
            searchParams.set("limit", String(params.limit));
        }
        if (params?.type) {
            searchParams.set("type", params.type);
        }

        const qs = searchParams.toString();
        const endpoint = qs ? `/notifications?${qs}` : "/notifications";
        return await httpClient.get<INotification[]>(endpoint);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};

export const markNotificationAsRead = async (
    id: string
): Promise<ApiResponse<INotification>> => {
    try {
        return await httpClient.patch<INotification>(`/notifications/${id}/read`, {});
    } catch (error) {
        console.error(`Error marking notification ${id} as read:`, error);
        throw error;
    }
};

export const markAllNotificationsAsRead = async (): Promise<ApiResponse<{ count: number }>> => {
    try {
        return await httpClient.patch<{ count: number }>("/notifications/mark-all-read", {});
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
};

export const deleteNotification = async (
    id: string
): Promise<ApiResponse<INotification>> => {
    try {
        return await httpClient.delete<INotification>(`/notifications/${id}`);
    } catch (error) {
        console.error(`Error deleting notification ${id}:`, error);
        throw error;
    }
};
