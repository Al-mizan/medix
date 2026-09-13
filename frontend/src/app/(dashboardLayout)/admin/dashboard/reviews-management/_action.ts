"use server";

import { revalidatePath } from "next/cache";

export const revalidateReviewsAction = async () => {
    try {
        revalidatePath("/admin/dashboard/reviews-management");
        return { success: true, message: "Reviews revalidated" };
    } catch {
        return { success: false, message: "Failed to revalidate reviews" };
    }
};
