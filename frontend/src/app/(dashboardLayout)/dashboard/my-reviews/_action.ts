"use server";

import { revalidatePath } from "next/cache";

export async function revalidateReviewsAction() {
  revalidatePath("/dashboard/my-reviews");
  revalidatePath("/dashboard/my-appointments");
  revalidatePath("/dashboard");
  return { success: true };
}
