"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Play, Clock, RefreshCw, User, Calendar, CreditCard, LayoutDashboard, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { changeAppointmentStatus } from "@/services/appointment.services"
import type { IAppointment } from "@/types/appointment.types"

interface PreCallScreenProps {
  appointment: IAppointment
  currentUserRole: string
}

export default function PreCallScreen({ appointment, currentUserRole }: PreCallScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isStarting, setIsStarting] = useState(false)

  const isDoctor = currentUserRole === "DOCTOR"
  const isPatient = currentUserRole === "PATIENT"

  const otherParticipantName = isDoctor
    ? appointment.patient?.name || "Patient"
    : appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : "Doctor"

  const otherParticipantPhoto = isDoctor
    ? appointment.patient?.profilePhoto
    : appointment.doctor?.profilePhoto

  const scheduleDate = appointment.schedule?.startDateTime
    ? new Date(appointment.schedule.startDateTime).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Scheduled Date"

  const scheduleTime = appointment.schedule?.startDateTime
    ? `${new Date(appointment.schedule.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${
        appointment.schedule?.endDateTime
          ? new Date(appointment.schedule.endDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : ""
      }`
    : "Scheduled Time"

  const handleStartConsultation = async () => {
    setIsStarting(true)
    try {
      const res = await changeAppointmentStatus(appointment.id, { status: "INPROGRESS" })
      if (res && (res.success || (res as unknown as { id: string }).id)) {
        toast.success("Consultation session started!")
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error("Failed to start consultation.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update appointment status."
      toast.error(msg)
    } finally {
      setIsStarting(false)
    }
  }

  // If appointment is already COMPLETED
  if (appointment.status === "COMPLETED") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-emerald-500/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <CardTitle className="text-xl">Consultation Concluded</CardTitle>
            <CardDescription>
              This appointment has been marked as completed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground pb-4">
            <p>Thank you for using Medix Telehealth.</p>
          </CardContent>
          <CardFooter className="flex justify-center gap-2">
            <Button
              onClick={() => {
                if (isDoctor) router.push("/doctor/dashboard/appointments")
                else router.push("/dashboard/my-appointments")
              }}
              className="w-full bg-[#0B7285] hover:bg-[#095E70] text-white"
            >
              <LayoutDashboard className="mr-2 size-4" />
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // If appointment is CANCELED
  if (appointment.status === "CANCELED") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-destructive/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-8" />
            </div>
            <CardTitle className="text-xl">Appointment Canceled</CardTitle>
            <CardDescription>
              This consultation has been canceled and the video room is unavailable.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => {
                if (isDoctor) router.push("/doctor/dashboard/appointments")
                else router.push("/dashboard/my-appointments")
              }}
              className="w-full bg-[#0B7285] hover:bg-[#095E70] text-white"
            >
              <LayoutDashboard className="mr-2 size-4" />
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-lg shadow-xl border-border bg-card">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 relative">
            <Avatar className="size-20 border-2 border-[#0B7285]/20 shadow-md">
              <AvatarImage src={otherParticipantPhoto || ""} />
              <AvatarFallback className="text-xl font-bold bg-[#0B7285]/10 text-[#0B7285]">
                {otherParticipantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Badge
              variant="outline"
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-[#0B7285]/30 bg-background text-[#0B7285] text-[10px] px-2"
            >
              {isDoctor ? "Patient" : "Doctor"}
            </Badge>
          </div>

          <CardTitle className="text-2xl font-bold tracking-tight">
            Consultation with {otherParticipantName}
          </CardTitle>
          <CardDescription className="text-sm">
            {isDoctor
              ? "You can review appointment details and launch the consultation when ready."
              : "Waiting for the doctor to open the consultation room."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Appointment Schedule Details */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/40 p-3.5 text-sm">
            <div className="flex items-center gap-2.5">
              <Calendar className="size-4 text-[#0B7285]" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-medium tracking-wider">Date</p>
                <p className="font-semibold text-foreground text-xs">{scheduleDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="size-4 text-[#0B7285]" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-medium tracking-wider">Time Window</p>
                <p className="font-semibold text-foreground text-xs">{scheduleTime}</p>
              </div>
            </div>
          </div>

          {/* Status & Payment Indicator */}
          <div className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Payment:</span>
              <Badge
                variant="outline"
                className={
                  appointment.paymentStatus === "PAID"
                    ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                }
              >
                {appointment.paymentStatus || "UNPAID"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Session Status:</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {appointment.status}
              </Badge>
            </div>
          </div>

          {/* Patient waiting notice */}
          {isPatient && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <Clock className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">The doctor has not started the session yet.</p>
                <p className="mt-0.5 text-amber-700/80 dark:text-amber-400">
                  Please keep this page open or click refresh once your consultation time begins.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 pt-2">
          {/* Doctor Start Button */}
          {isDoctor && (
            <Button
              onClick={handleStartConsultation}
              disabled={isStarting || isPending}
              className="w-full bg-[#0B7285] hover:bg-[#095E70] text-white gap-2 h-10 shadow-md font-semibold"
            >
              {isStarting || isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4 fill-white" />
              )}
              Start Consultation Now
            </Button>
          )}

          {/* Patient Refresh Button */}
          {isPatient && (
            <Button
              onClick={() => {
                startTransition(() => {
                  router.refresh()
                })
              }}
              disabled={isPending}
              variant="outline"
              className="w-full gap-2 h-10"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Check If Doctor Started
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isDoctor) router.push("/doctor/dashboard/appointments")
              else if (isPatient) router.push("/dashboard/my-appointments")
              else router.push("/admin/dashboard/appointments-management")
            }}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            <LayoutDashboard className="mr-1.5 size-3.5" />
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
