"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import { ISpecialty, IUpdateSpecialtyPayload } from "@/types/specialty.types";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export const getSpecialties = async (queryString?: string) => {
    try {
        const url = queryString ? `/specialties?${queryString}` : "/specialties";
        return await httpClient.get<ISpecialty[]>(url);
    } catch (error) {
        console.error("Error fetching specialties:", error);
        throw error;
    }
};

export const createSpecialty = async (formData: FormData): Promise<ApiResponse<ISpecialty>> => {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ");

        const res = await fetch(`${BASE_API_URL}/specialties`, {
            method: "POST",
            headers: {
                Cookie: cookieHeader,
            },
            body: formData,
        });

        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.message || "Failed to create specialty");
        }

        return result;
    } catch (error) {
        console.error("Error creating specialty:", error);
        throw error;
    }
};

export const updateSpecialty = async (id: string, payload: IUpdateSpecialtyPayload) => {
    try {
        return await httpClient.patch<ISpecialty>(`/specialties/${id}`, payload);
    } catch (error) {
        console.error("Error updating specialty:", error);
        throw error;
    }
};

export const deleteSpecialty = async (id: string) => {
    try {
        return await httpClient.delete<{ message: string }>(`/specialties/${id}`);
    } catch (error) {
        console.error("Error deleting specialty:", error);
        throw error;
    }
};
