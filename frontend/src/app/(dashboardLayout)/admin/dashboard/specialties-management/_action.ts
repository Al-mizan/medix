"use server";

import {
    createSpecialty,
    deleteSpecialty,
    updateSpecialty,
} from "@/services/specialty.services";
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types";
import {
    type ISpecialty,
    type IUpdateSpecialtyPayload,
} from "@/types/specialty.types";
import { updateSpecialtyFormZodSchema } from "@/zod/specialty.validation";

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

export const createSpecialtyAction = async (
    formData: FormData,
): Promise<ApiResponse<ISpecialty> | ApiErrorResponse> => {
    try {
        const file = formData.get("file");
        const dataString = formData.get("data");

        if (!file) {
            return {
                success: false,
                message: "Specialty icon file is required",
            };
        }

        if (!dataString || typeof dataString !== "string") {
            return {
                success: false,
                message: "Specialty data is required",
            };
        }

        const data = JSON.parse(dataString);
        if (!data.title || typeof data.title !== "string" || data.title.trim().length < 2) {
            return {
                success: false,
                message: "Specialty title must be at least 2 characters",
            };
        }

        return await createSpecialty(formData);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to create specialty"),
        };
    }
};

export const updateSpecialtyAction = async (
    id: string,
    payload: IUpdateSpecialtyPayload,
): Promise<ApiResponse<ISpecialty> | ApiErrorResponse> => {
    const parsedPayload = updateSpecialtyFormZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        return {
            success: false,
            message: parsedPayload.error.issues[0]?.message || "Invalid input",
        };
    }

    try {
        return await updateSpecialty(id, parsedPayload.data);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to update specialty"),
        };
    }
};

export const deleteSpecialtyAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) {
        return {
            success: false,
            message: "Invalid specialty id",
        };
    }

    try {
        return await deleteSpecialty(id);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to delete specialty"),
        };
    }
};
