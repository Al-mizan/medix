"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { type ApiResponse } from "@/types/api.types";
import { type IPayment } from "@/types/payment.types";

export const getAllPayments = async (
    queryString?: string | unknown,
): Promise<ApiResponse<IPayment[]>> => {
    try {
        const qs = typeof queryString === "string" ? queryString : undefined;
        const endpoint = qs ? `/payments?${qs}` : "/payments";
        return await httpClient.get<IPayment[]>(endpoint);
    } catch (error) {
        console.log("Error fetching all payments:", error);
        throw error;
    }
};
