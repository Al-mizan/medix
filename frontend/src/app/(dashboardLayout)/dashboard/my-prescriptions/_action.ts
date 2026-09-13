"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePrescriptionsAction() {
    revalidatePath("/dashboard/my-prescriptions");
    revalidatePath("/dashboard");
    return { success: true };
}
