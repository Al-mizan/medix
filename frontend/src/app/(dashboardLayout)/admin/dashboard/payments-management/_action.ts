"use server";

import { revalidatePath } from "next/cache";

export const revalidatePaymentsAction = async () => {
    try {
        revalidatePath("/admin/dashboard/payments-management");
        return { success: true, message: "Payments revalidated successfully" };
    } catch {
        return { success: false, message: "Failed to revalidate payments" };
    }
};
