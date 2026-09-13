import React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AlertCircle, CreditCard, LayoutDashboard } from "lucide-react"
import { getAppointmentByVideoCallingId } from "@/services/appointment.services"
import { getUserInfo } from "@/services/auth.services"
import VideoCallRoom from "@/components/modules/Consultation/VideoCallRoom"
import PreCallScreen from "@/components/modules/Consultation/PreCallScreen"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ConsultationSessionPageProps {
  params: Promise<{
    videoCallingId: string
  }>
}

export default async function ConsultationSessionPage({
  params,
}: ConsultationSessionPageProps) {
  const { videoCallingId } = await params

  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  if (!accessToken) {
    redirect(`/login?redirect=/consultation/session/${videoCallingId}`)
  }

  const currentUser = await getUserInfo()
  if (!currentUser) {
    redirect(`/login?redirect=/consultation/session/${videoCallingId}`)
  }

  let appointment = null
  let errorMessage = null

  try {
    const res = await getAppointmentByVideoCallingId(videoCallingId)
    appointment = res.data
  } catch (error: unknown) {
    console.error("Failed to load appointment for video call:", error)
    errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to load consultation appointment. You may not have permission to view this room."
  }

  if (!appointment || errorMessage) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-8" />
            </div>
            <CardTitle className="text-xl">Consultation Not Found</CardTitle>
            <CardDescription>
              {errorMessage || "The requested consultation session does not exist or you do not have permission to access it."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pt-4">
            <Button asChild className="w-full bg-[#0B7285] hover:bg-[#095E70] text-white">
              <Link href={currentUser.role === "DOCTOR" ? "/doctor/dashboard/appointments" : "/dashboard/my-appointments"}>
                <LayoutDashboard className="mr-2 size-4" />
                Return to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // If unpaid
  if (appointment.paymentStatus !== "PAID") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-amber-500/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <CreditCard className="size-8" />
            </div>
            <CardTitle className="text-xl">Payment Required</CardTitle>
            <CardDescription>
              This consultation appointment has not been paid for yet. Consultations can only be joined after successful payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Fee: ৳{appointment.doctor?.appointmentFee?.toFixed(2) ?? "0.00"}</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-2">
            {currentUser.role === "PATIENT" && (
              <Button asChild className="w-full bg-[#0B7285] hover:bg-[#095E70] text-white">
                <Link href="/dashboard/my-appointments">
                  Go to Appointments & Pay
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href={currentUser.role === "DOCTOR" ? "/doctor/dashboard/appointments" : "/dashboard/my-appointments"}>
                <LayoutDashboard className="mr-2 size-4" />
                Return to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Pre-call gate: If not INPROGRESS yet, render PreCallScreen
  if (appointment.status !== "INPROGRESS") {
    return (
      <PreCallScreen
        appointment={appointment}
        currentUserRole={currentUser.role}
      />
    )
  }

  // Active call: render VideoCallRoom
  return (
    <VideoCallRoom
      appointment={appointment}
      token={accessToken}
      currentUserRole={currentUser.role}
      currentUserId={currentUser.id}
    />
  )
}
