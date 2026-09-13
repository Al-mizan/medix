"use server";

import { revalidatePath } from "next/cache";
import { changeAppointmentStatus } from "@/services/appointment.services";
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types";
import { type IAppointment } from "@/types/appointment.types";

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

export const changeAppointmentStatusAction = async (
    appointmentId: string,
    status: string,
): Promise<ApiResponse<IAppointment> | ApiErrorResponse> => {
    if (!appointmentId || !status) {
        return {
            success: false,
            message: "Appointment ID and status are required",
        };
    }

    try {
        const result = await changeAppointmentStatus(appointmentId, { status });
        revalidatePath("/admin/dashboard/appointments-management");
        return result;
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(
                error,
                "Failed to update appointment status",
            ),
        };
    }
};
