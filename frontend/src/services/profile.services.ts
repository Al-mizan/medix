"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import { UserInfo } from "@/types/user.types";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function getMyProfileService(): Promise<ApiResponse<UserInfo>> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;

        if (!accessToken) {
            throw new Error("Unauthorized. Please log in.");
        }

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken || ""}`,
            },
            cache: "no-store",
        });

        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.message || "Failed to fetch user profile");
        }

        return result;
    } catch (error: unknown) {
        console.error("Error fetching my profile:", error);
        throw error;
    }
}

export async function updatePatientProfileService(formData: FormData): Promise<ApiResponse<unknown>> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
        throw new Error("Unauthorized. Please log in.");
    }

    const res = await fetch(`${BASE_API_URL}/patients/update-my-profile`, {
        method: "PATCH",
        headers: {
            Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken || ""}`,
        },
        body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Failed to update profile");
    }

    return result;
}

export async function updateDoctorProfileService(
    doctorId: string,
    payload: {
        doctor: {
            name?: string;
            contactNumber?: string;
            address?: string;
        };
    }
): Promise<ApiResponse<unknown>> {
    try {
        return await httpClient.patch(`/doctors/${doctorId}`, payload);
    } catch (error: unknown) {
        console.error("Error updating doctor profile:", error);
        throw error;
    }
}

export async function updateAdminProfileService(
    adminId: string,
    payload: {
        admin: {
            name?: string;
            contactNumber?: string;
        };
    }
): Promise<ApiResponse<unknown>> {
    try {
        return await httpClient.patch(`/admins/${adminId}`, payload);
    } catch (error: unknown) {
        console.error("Error updating admin profile:", error);
        throw error;
    }
}
