"use server";

import {
    changeUserRole,
    changeUserStatus,
    createAdmin,
    deleteAdmin,
    getAdminById,
    updateAdmin,
} from "@/services/admin.services";
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types";
import {
    type IAdmin,
    type IChangeUserRolePayload,
    type IChangeUserStatusPayload,
    type ICreateAdminPayload,
    type IUpdateAdminPayload,
} from "@/types/admin.types";
import {
    createAdminFormZodSchema,
    updateAdminFormZodSchema,
} from "@/zod/admin.validation";

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
    ) {
        return error.response.data.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallbackMessage;
};

export const createAdminAction = async (
    payload: ICreateAdminPayload,
): Promise<ApiResponse<IAdmin> | ApiErrorResponse> => {
    const parsed = createAdminFormZodSchema.safeParse({
        password: payload.password,
        name: payload.admin.name,
        email: payload.admin.email,
        contactNumber: payload.admin.contactNumber,
        role: payload.role,
    });

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message || "Invalid input",
        };
    }

    try {
        return await createAdmin(payload);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to create admin"),
        };
    }
};

export const updateAdminAction = async (
    id: string,
    payload: IUpdateAdminPayload,
): Promise<ApiResponse<IAdmin> | ApiErrorResponse> => {
    const parsed = updateAdminFormZodSchema.safeParse(payload.admin);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message || "Invalid input",
        };
    }

    try {
        return await updateAdmin(id, payload);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to update admin"),
        };
    }
};

export const deleteAdminAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) {
        return {
            success: false,
            message: "Invalid admin id",
        };
    }

    try {
        return await deleteAdmin(id);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to delete admin"),
        };
    }
};

export const changeUserStatusAction = async (
    payload: IChangeUserStatusPayload,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!payload.userId || !payload.userStatus) {
        return {
            success: false,
            message: "User ID and Status are required",
        };
    }

    try {
        return await changeUserStatus(payload);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to change user status"),
        };
    }
};

export const changeUserRoleAction = async (
    payload: IChangeUserRolePayload,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!payload.userId || !payload.role) {
        return {
            success: false,
            message: "User ID and Role are required",
        };
    }

    try {
        return await changeUserRole(payload);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to change user role"),
        };
    }
};

export const getAdminByIdAction = async (
    id: string,
): Promise<ApiResponse<IAdmin> | ApiErrorResponse> => {
    if (!id) {
        return {
            success: false,
            message: "Invalid admin id",
        };
    }

    try {
        return await getAdminById(id);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to fetch admin"),
        };
    }
};
