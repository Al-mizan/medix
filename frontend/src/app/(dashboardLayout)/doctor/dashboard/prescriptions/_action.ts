"use server"

import {
  createPrescription,
  deletePrescription,
  updatePrescription,
} from "@/services/prescription.services"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import {
  ICreatePrescriptionPayload,
  IPrescription,
  IUpdatePrescriptionPayload,
} from "@/types/prescription.types"
import {
  createPrescriptionServerZodSchema,
  updatePrescriptionServerZodSchema,
} from "@/zod/prescription.validation"
import { revalidatePath } from "next/cache"

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}

export const createPrescriptionAction = async (
  payload: ICreatePrescriptionPayload
): Promise<ApiResponse<IPrescription> | ApiErrorResponse> => {
  const parsed = createPrescriptionServerZodSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input",
    }
  }

  try {
    const result = await createPrescription(parsed.data)
    revalidatePath("/doctor/dashboard/prescriptions")
    revalidatePath("/doctor/dashboard/appointments")
    revalidatePath("/doctor/dashboard")
    return result
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create prescription"),
    }
  }
}

export const updatePrescriptionAction = async (
  id: string,
  payload: Partial<IUpdatePrescriptionPayload>
): Promise<ApiResponse<IPrescription> | ApiErrorResponse> => {
  if (!id) {
    return {
      success: false,
      message: "Prescription ID is required",
    }
  }

  const parsed = updatePrescriptionServerZodSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input",
    }
  }

  try {
    const result = await updatePrescription(id, parsed.data)
    revalidatePath("/doctor/dashboard/prescriptions")
    return result
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update prescription"),
    }
  }
}

export const deletePrescriptionAction = async (
  id: string
): Promise<ApiResponse<null> | ApiErrorResponse> => {
  if (!id) {
    return {
      success: false,
      message: "Prescription ID is required",
    }
  }

  try {
    await deletePrescription(id)
    revalidatePath("/doctor/dashboard/prescriptions")
    revalidatePath("/doctor/dashboard/appointments")
    return {
      success: true,
      message: "Prescription deleted successfully",
      data: null,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete prescription"),
    }
  }
}
