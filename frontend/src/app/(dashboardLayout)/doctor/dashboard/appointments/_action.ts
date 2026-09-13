"use server"

import { changeAppointmentStatus } from "@/services/appointment.services"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import { type AppointmentStatus, type IAppointment } from "@/types/appointment.types"
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

export const changeDoctorAppointmentStatusAction = async (
  appointmentId: string,
  payload: { status: AppointmentStatus }
): Promise<ApiResponse<IAppointment> | ApiErrorResponse> => {
  if (!appointmentId) {
    return {
      success: false,
      message: "Appointment ID is required",
    }
  }

  if (!payload.status) {
    return {
      success: false,
      message: "Target status is required",
    }
  }

  try {
    const result = await changeAppointmentStatus(appointmentId, payload)
    revalidatePath("/doctor/dashboard/appointments")
    revalidatePath("/doctor/dashboard")
    return result
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update appointment status"),
    }
  }
}
