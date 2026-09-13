"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { type ApiResponse } from "@/types/api.types"
import {
  type IAppointment,
  type IBookAppointmentPayload,
  type IBookAppointmentResult,
  type IInitiatePaymentResult,
} from "@/types/appointment.types"

export const bookAppointment = async (payload: IBookAppointmentPayload) => {
  try {
    return await httpClient.post<IBookAppointmentResult>("/appointments/book-appointment", payload)
  } catch (error) {
    console.log("Error booking appointment:", error)
    throw error
  }
}

export const bookAppointmentWithPayLater = async (payload: IBookAppointmentPayload) => {
  try {
    return await httpClient.post<IBookAppointmentResult>(
      "/appointments/book-appointment-with-pay-later",
      payload,
    )
  } catch (error) {
    console.log("Error booking appointment with pay later:", error)
    throw error
  }
}

export const initiateAppointmentPayment = async (appointmentId: string) => {
  try {
    return await httpClient.post<IInitiatePaymentResult>(
      `/appointments/initiate-payment/${appointmentId}`,
      {},
    )
  } catch (error) {
    console.log("Error initiating appointment payment:", error)
    throw error
  }
}

export const getMyAppointments = async (queryString?: string | unknown) => {
  try {
    const qs = typeof queryString === "string" ? queryString : undefined
    const endpoint = qs
      ? `/appointments/my-appointments?${qs}`
      : "/appointments/my-appointments"
    return await httpClient.get<IAppointment[]>(endpoint)
  } catch (error) {
    console.log("Error fetching my appointments:", error)
    throw error
  }
}

export const getAllAppointments = async (
  queryString?: string | unknown
): Promise<ApiResponse<IAppointment[]>> => {
  try {
    const qs = typeof queryString === "string" ? queryString : undefined
    const endpoint = qs
      ? `/appointments/all-appointments?${qs}`
      : "/appointments/all-appointments"
    return await httpClient.get<IAppointment[]>(endpoint)
  } catch (error) {
    console.log("Error fetching all appointments:", error)
    throw error
  }
}

export const changeAppointmentStatus = async (
  appointmentId: string,
  payload: { status: string }
) => {
  try {
    return await httpClient.patch<IAppointment>(
      `/appointments/change-appointment-status/${appointmentId}`,
      payload
    )
  } catch (error) {
    console.log("Error updating appointment status:", error)
    throw error
  }
}

export const getMySingleAppointment = async (appointmentId: string) => {
  try {
    return await httpClient.get<IAppointment>(`/appointments/my-single-appointment/${appointmentId}`)
  } catch (error) {
    console.log("Error fetching appointment details:", error)
    throw error
  }
}