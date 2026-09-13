"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IAdminDashboardData, IDoctorDashboardData, IPatientDashboardData } from "@/types/dashboard.types";

export async function getDashboardData<T = IAdminDashboardData>() {
    try {
        const response = await httpClient.get<T>("/stats")

        return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred while fetching dashboard data.";
      return {
        success: false as const,
        message,
        data: null,
        meta: undefined,
      }  
    }
}

export async function getDoctorDashboardData() {
    return getDashboardData<IDoctorDashboardData>();
}

export async function getPatientDashboardData() {
    return getDashboardData<IPatientDashboardData>();
}