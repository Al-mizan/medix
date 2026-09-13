"use server";

import { revalidatePath } from "next/cache";

export const revalidateDoctorSchedulesAction = async () => {
    try {
        revalidatePath("/admin/dashboard/doctor-schedules-managament");
        return { success: true, message: "Doctor schedules revalidated" };
    } catch {
        return {
            success: false,
            message: "Failed to revalidate doctor schedules",
        };
    }
};
