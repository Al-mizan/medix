"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IPatient, IPatientDetails } from "@/types/patient.types";

export const getAllPatients = async (queryString?: string) => {
    try {
        const url = queryString ? `/patients?${queryString}` : "/patients";
        return await httpClient.get<IPatient[]>(url);
    } catch (error) {
        console.error("Error fetching patients:", error);
        throw error;
    }
};

export const getPatientById = async (id: string) => {
    try {
        return await httpClient.get<IPatientDetails>(`/patients/${id}`);
    } catch (error) {
        console.error("Error fetching patient by id:", error);
        throw error;
    }
};

export const deletePatient = async (id: string) => {
    try {
        return await httpClient.delete<{ message: string }>(`/patients/${id}`);
    } catch (error) {
        console.error("Error deleting patient:", error);
        throw error;
    }
};
