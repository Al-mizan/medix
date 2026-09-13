"use server";

import { revalidatePath } from "next/cache";

export const revalidatePrescriptionsAction = async () => {
    try {
        revalidatePath("/admin/dashboard/prescriptions-management");
        return { success: true, message: "Prescriptions revalidated" };
    } catch {
        return { success: false, message: "Failed to revalidate prescriptions" };
    }
};
