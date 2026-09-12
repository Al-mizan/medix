"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IAdminDashboardData } from "@/types/dashboard.types";

export async function getDashboardData() {
    try {
        const response = await httpClient.get<IAdminDashboardData>("/stats")

        return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred while fetching dashboard data.";
      return {
        success: false,
        message,
        data: null,
        meta: null,
      }  
    }
}