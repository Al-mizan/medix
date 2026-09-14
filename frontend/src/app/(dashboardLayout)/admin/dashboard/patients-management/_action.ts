"use server";

import { deletePatient, getPatientById } from "@/services/adminPatient.services";
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types";
import { type IPatientDetails } from "@/types/patient.types";

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

export const deletePatientAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) {
        return {
            success: false,
            message: "Invalid patient id",
        };
    }

    try {
        return await deletePatient(id);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to delete patient"),
        };
    }
};

export const getPatientByIdAction = async (
    id: string,
): Promise<ApiResponse<IPatientDetails> | ApiErrorResponse> => {
    if (!id) {
        return {
            success: false,
            message: "Invalid patient id",
        };
    }

    try {
        return await getPatientById(id);
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to fetch patient details"),
        };
    }
};
