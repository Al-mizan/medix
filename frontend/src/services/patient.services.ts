"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import { IPatientProfile, IUpdatePatientProfilePayload } from "@/types/patient.types";

export async function getMyPatientProfile(): Promise<ApiResponse<IPatientProfile>> {
    try {
        return await httpClient.get<IPatientProfile>("/patients/my-profile");
    } catch (error: unknown) {
        console.error("Error fetching my patient profile:", error);
        throw error;
    }
}

export async function updateMyPatientProfile(
    payload: IUpdatePatientProfilePayload
): Promise<ApiResponse<IPatientProfile>> {
    try {
        return await httpClient.patch<IPatientProfile>("/patients/update-my-profile", payload);
    } catch (error: unknown) {
        console.error("Error updating patient profile:", error);
        throw error;
    }
}
