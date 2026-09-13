"use server";

import { updateMyPatientProfile } from "@/services/patient.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { IPatientProfile } from "@/types/patient.types";
import { patientHealthDataServerSchema } from "@/zod/patient.validation";
import { revalidatePath } from "next/cache";

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

export const updatePatientHealthDataAction = async (
    payload: unknown
): Promise<ApiResponse<IPatientProfile> | ApiErrorResponse> => {
    const parsedPayload = patientHealthDataServerSchema.safeParse(payload);

    if (!parsedPayload.success) {
        return {
            success: false,
            message: parsedPayload.error.issues[0]?.message || "Invalid health data input",
        };
    }

    try {
        const result = await updateMyPatientProfile({
            patientHealthData: parsedPayload.data,
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/health-records");

        return result;
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to update health records"),
        };
    }
};

export const uploadMedicalReportAction = async (
    formData: FormData
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    try {
        const { updatePatientProfileService } = await import("@/services/profile.services");
        const file = formData.get("file") as File | null;
        const reportName = formData.get("reportName") as string | null;

        if (!file || file.size === 0) {
            return {
                success: false,
                message: "Please select a file to upload",
            };
        }

        if (file.size > 10 * 1024 * 1024) {
            return {
                success: false,
                message: "File size exceeds 10MB limit",
            };
        }

        const backendFormData = new FormData();
        // Give the file the user's custom report name so Multer originalname picks it up
        const finalFileName = reportName?.trim()
            ? `${reportName.trim()}.${file.name.split(".").pop() || "pdf"}`
            : file.name;

        const renamedFile = new File([file], finalFileName, { type: file.type });
        backendFormData.append("medicalReports", renamedFile);

        const result = await updatePatientProfileService(backendFormData);

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/health-records");
        revalidatePath("/my-profile");

        return result;
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to upload medical report"),
        };
    }
};

export const deleteMedicalReportAction = async (
    reportId: string
): Promise<ApiResponse<IPatientProfile> | ApiErrorResponse> => {
    if (!reportId) {
        return {
            success: false,
            message: "Report ID is required to delete",
        };
    }

    try {
        const result = await updateMyPatientProfile({
            medicalReports: [
                {
                    reportId,
                    shouldDelete: true,
                },
            ],
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/health-records");
        revalidatePath("/my-profile");

        return result;
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Failed to delete medical report"),
        };
    }
};

