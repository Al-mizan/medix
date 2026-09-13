"use server";

import {
    getMyProfileService,
    updateAdminProfileService,
    updateDoctorProfileService,
    updatePatientProfileService,
} from "@/services/profile.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { UserInfo } from "@/types/user.types";
import {
    adminProfileEditSchema,
    doctorProfileEditSchema,
    patientProfileEditSchema,
} from "@/zod/profile.validation";
import { revalidatePath } from "next/cache";

export const getMyProfileAction = async (): Promise<ApiResponse<UserInfo> | ApiErrorResponse> => {
    try {
        const response = await getMyProfileService();
        return response;
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to load user profile";
        return {
            success: false,
            message,
        };
    }
};

export const updatePatientProfileAction = async (
    formData: FormData
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    try {
        const rawData = formData.get("data");
        if (rawData && typeof rawData === "string") {
            const parsedJson = JSON.parse(rawData);
            const patientInfo = parsedJson?.patientInfo;
            if (patientInfo) {
                const validation = patientProfileEditSchema.safeParse(patientInfo);
                if (!validation.success) {
                    return {
                        success: false,
                        message:
                            validation.error.issues[0]?.message ||
                            "Invalid profile details",
                    };
                }
            }
        }

        const result = await updatePatientProfileService(formData);
        revalidatePath("/my-profile");
        revalidatePath("/", "layout");
        return result;
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to update profile";
        return {
            success: false,
            message,
        };
    }
};

export const updateDoctorProfileAction = async (
    doctorId: string,
    payload: { name: string; contactNumber?: string; address?: string }
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    const parsed = doctorProfileEditSchema.safeParse(payload);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message || "Invalid doctor profile details",
        };
    }

    try {
        const result = await updateDoctorProfileService(doctorId, {
            doctor: {
                name: parsed.data.name,
                contactNumber: parsed.data.contactNumber || undefined,
                address: parsed.data.address || undefined,
            },
        });
        revalidatePath("/my-profile");
        revalidatePath("/", "layout");
        return result;
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to update doctor profile";
        return {
            success: false,
            message,
        };
    }
};

export const updateAdminProfileAction = async (
    adminId: string,
    payload: { name: string; contactNumber?: string }
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    const parsed = adminProfileEditSchema.safeParse(payload);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message || "Invalid admin profile details",
        };
    }

    try {
        const result = await updateAdminProfileService(adminId, {
            admin: {
                name: parsed.data.name,
                contactNumber: parsed.data.contactNumber || undefined,
            },
        });
        revalidatePath("/my-profile");
        revalidatePath("/", "layout");
        return result;
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to update admin profile";
        return {
            success: false,
            message,
        };
    }
};
