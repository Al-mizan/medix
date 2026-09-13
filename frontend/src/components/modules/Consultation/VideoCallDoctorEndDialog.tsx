import React from "react"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { IAppointment } from "@/types/appointment.types"

interface VideoCallDoctorEndDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: IAppointment
  elapsedSeconds: number
}

const formatTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function VideoCallDoctorEndDialog({
  open,
  onOpenChange,
  appointment,
  elapsedSeconds,
}: VideoCallDoctorEndDialogProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="size-5 text-[#0B7285]" />
            Consultation Concluded
          </DialogTitle>
          <DialogDescription>
            The video consultation with {appointment.patient?.name || "the patient"} has ended. Would you like to issue a digital prescription for this appointment now?
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
          <p><strong>Appointment ID:</strong> {appointment.id}</p>
          <p><strong>Patient:</strong> {appointment.patient?.name || "N/A"}</p>
          <p><strong>Call Duration:</strong> {formatTimer(elapsedSeconds)}</p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              router.push("/doctor/dashboard/appointments")
            }}
          >
            Back to Appointments
          </Button>
          <Button
            className="bg-[#0B7285] hover:bg-[#095E70] text-white gap-1.5"
            onClick={() => {
              onOpenChange(false)
              router.push(`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`)
            }}
          >
            <FileText className="size-4" />
            Create Prescription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
