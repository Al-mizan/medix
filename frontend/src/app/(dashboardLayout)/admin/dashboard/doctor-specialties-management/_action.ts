"use server";

import { revalidatePath } from "next/cache";

export const revalidateDoctorSpecialtiesAction = async () => {
    try {
        revalidatePath("/admin/dashboard/doctor-specialties-management");
        return {
            success: true,
            message: "Doctor specialties revalidated successfully",
        };
    } catch {
        return {
            success: false,
            message: "Failed to revalidate doctor specialties",
        };
    }
};
