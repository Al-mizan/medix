"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
    IAdmin,
    ICreateAdminPayload,
    IUpdateAdminPayload,
    IChangeUserStatusPayload,
    IChangeUserRolePayload,
} from "@/types/admin.types";

export const getAllAdmins = async (queryString?: string) => {
    try {
        const url = queryString ? `/admins?${queryString}` : "/admins";
        return await httpClient.get<IAdmin[]>(url);
    } catch (error) {
        console.error("Error fetching admins:", error);
        throw error;
    }
};

export const getAdminById = async (id: string) => {
    try {
        return await httpClient.get<IAdmin>(`/admins/${id}`);
    } catch (error) {
        console.error("Error fetching admin by id:", error);
        throw error;
    }
};

export const createAdmin = async (payload: ICreateAdminPayload) => {
    try {
        return await httpClient.post<IAdmin>("/users/create-admin", payload);
    } catch (error) {
        console.error("Error creating admin:", error);
        throw error;
    }
};

export const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
    try {
        return await httpClient.patch<IAdmin>(`/admins/${id}`, payload);
    } catch (error) {
        console.error("Error updating admin:", error);
        throw error;
    }
};

export const deleteAdmin = async (id: string) => {
    try {
        return await httpClient.delete<{ message: string }>(`/admins/${id}`);
    } catch (error) {
        console.error("Error deleting admin:", error);
        throw error;
    }
};

export const changeUserStatus = async (payload: IChangeUserStatusPayload) => {
    try {
        return await httpClient.patch("/admins/change-user-status", payload);
    } catch (error) {
        console.error("Error changing user status:", error);
        throw error;
    }
};

export const changeUserRole = async (payload: IChangeUserRolePayload) => {
    try {
        return await httpClient.patch("/admins/change-user-role", payload);
    } catch (error) {
        console.error("Error changing user role:", error);
        throw error;
    }
};
