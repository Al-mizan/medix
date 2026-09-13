"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  ICreatePrescriptionPayload,
  IPrescription,
  IUpdatePrescriptionPayload,
} from "@/types/prescription.types";

export async function getMyPrescriptions(
  queryString?: string | unknown
): Promise<ApiResponse<IPrescription[]>> {
  try {
    const qs = typeof queryString === "string" ? queryString : undefined;
    const endpoint = qs
      ? `/prescriptions/my-prescriptions?${qs}`
      : "/prescriptions/my-prescriptions";
    return await httpClient.get<IPrescription[]>(endpoint);
  } catch (error: unknown) {
    console.error("Error fetching my prescriptions:", error);
    throw error;
  }
}

export async function getAllPrescriptions(
  queryString?: string | unknown
): Promise<ApiResponse<IPrescription[]>> {
  try {
    const qs = typeof queryString === "string" ? queryString : undefined;
    const endpoint = qs ? `/prescriptions?${qs}` : "/prescriptions";
    return await httpClient.get<IPrescription[]>(endpoint);
  } catch (error: unknown) {
    console.error("Error fetching all prescriptions:", error);
    throw error;
  }
}

export async function createPrescription(
  payload: ICreatePrescriptionPayload
): Promise<ApiResponse<IPrescription>> {
  try {
    return await httpClient.post<IPrescription>("/prescriptions", payload);
  } catch (error) {
    console.error("Error creating prescription:", error);
    throw error;
  }
}

export async function updatePrescription(
  id: string,
  payload: Partial<IUpdatePrescriptionPayload>
): Promise<ApiResponse<IPrescription>> {
  try {
    return await httpClient.patch<IPrescription>(`/prescriptions/${id}`, payload);
  } catch (error) {
    console.error("Error updating prescription:", error);
    throw error;
  }
}

export async function deletePrescription(id: string): Promise<ApiResponse<null>> {
  try {
    return await httpClient.delete<null>(`/prescriptions/${id}`);
  } catch (error) {
    console.error("Error deleting prescription:", error);
    throw error;
  }
}
