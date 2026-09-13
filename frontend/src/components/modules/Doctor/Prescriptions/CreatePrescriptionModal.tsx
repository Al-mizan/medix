"use client"

import { createPrescriptionAction } from "@/app/(dashboardLayout)/doctor/dashboard/prescriptions/_action"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getMyAppointments } from "@/services/appointment.services"
import { getMyPrescriptions } from "@/services/prescription.services"
import { ApiResponse } from "@/types/api.types"
import { IAppointment } from "@/types/appointment.types"
import { IMedicationItem, IPrescription } from "@/types/prescription.types"
import { formatPrescriptionInstructions } from "@/zod/prescription.validation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Plus, Trash2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

interface CreatePrescriptionModalProps {
  initialAppointmentId?: string
  triggerButton?: React.ReactNode
}

const emptyMedication: IMedicationItem = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
}

const CreatePrescriptionModal = ({
  initialAppointmentId,
  triggerButton,
}: CreatePrescriptionModalProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const urlAppointmentId = searchParams.get("appointmentId") || ""
  const defaultSelectedId = initialAppointmentId || urlAppointmentId

  const [open, setOpen] = useState(Boolean(defaultSelectedId))
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(defaultSelectedId)
  const [followUpDate, setFollowUpDate] = useState<string>("")
  const [generalInstructions, setGeneralInstructions] = useState<string>("")
  const [medications, setMedications] = useState<IMedicationItem[]>([{ ...emptyMedication }])

  // Sync state if url appointmentId changes
  useEffect(() => {
    if (urlAppointmentId) {
      setSelectedAppointmentId(urlAppointmentId)
      setOpen(true)
    }
  }, [urlAppointmentId])

  // Query appointments and existing prescriptions
  const { data: appointmentsResponse, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => getMyAppointments(),
  })

  const { data: prescriptionsResponse } = useQuery({
    queryKey: ["my-prescriptions"],
    queryFn: () => getMyPrescriptions(),
  })

  const appointments = (appointmentsResponse as ApiResponse<IAppointment[]>)?.data ?? []
  const prescriptions = (prescriptionsResponse as ApiResponse<IPrescription[]>)?.data ?? []

  // Completed appointments without an existing prescription
  const eligibleAppointments = useMemo(() => {
    const prescribedIds = new Set(prescriptions.map((p) => p.appointmentId))
    const eligible = appointments.filter(
      (apt) => apt.status === "COMPLETED" && !prescribedIds.has(apt.id)
    )

    // Ensure selected appointment is present in options even if already in state
    if (selectedAppointmentId) {
      const selected = appointments.find((a) => a.id === selectedAppointmentId)
      if (selected && !eligible.some((a) => a.id === selected.id)) {
        eligible.unshift(selected)
      }
    }

    return eligible
  }, [appointments, prescriptions, selectedAppointmentId])

  const { mutateAsync: createPrescriptionMutation, isPending } = useMutation({
    mutationFn: createPrescriptionAction,
  })

  // Dynamic medication handlers
  const handleAddMedication = () => {
    setMedications((prev) => [...prev, { ...emptyMedication }])
  }

  const handleRemoveMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMedicationChange = (
    index: number,
    field: keyof IMedicationItem,
    value: string
  ) => {
    setMedications((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    )
  }

  const resetForm = () => {
    setSelectedAppointmentId("")
    setFollowUpDate("")
    setGeneralInstructions("")
    setMedications([{ ...emptyMedication }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAppointmentId) {
      toast.error("Please select a completed appointment")
      return
    }

    const formattedInstructions = formatPrescriptionInstructions(
      medications,
      generalInstructions
    )

    if (!formattedInstructions || formattedInstructions.trim().length === 0) {
      toast.error("Please add at least one medication or instruction")
      return
    }

    try {
      const payload = {
        appointmentId: selectedAppointmentId,
        instructions: formattedInstructions,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined,
      }

      const result = await createPrescriptionMutation(payload)

      if (!result.success) {
        toast.error(result.message || "Failed to create prescription")
        return
      }

      toast.success(result.message || "Prescription issued successfully!")
      setOpen(false)
      resetForm()

      void queryClient.invalidateQueries({ queryKey: ["my-prescriptions"] })
      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
      void queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-data"] })

      // Clear search param if present
      if (urlAppointmentId) {
        router.replace("/doctor/dashboard/prescriptions")
      } else {
        router.refresh()
      }
    } catch {
      toast.error("An unexpected error occurred while creating prescription")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          if (urlAppointmentId) {
            router.replace("/doctor/dashboard/prescriptions")
          }
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button type="button" className="bg-[#0B7285] text-white hover:bg-[#095E70]">
            <Plus className="mr-1.5 size-4" />
            Issue Prescription
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-2xl gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Create Electronic Prescription
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Author a medical prescription with medication schedule and advice for completed consultations.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(92vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            {/* Appointment Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="appointmentSelect" className="text-xs font-semibold text-foreground">
                Select Completed Appointment <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedAppointmentId}
                onValueChange={(val) => setSelectedAppointmentId(val)}
                disabled={isLoadingAppointments || Boolean(initialAppointmentId) || Boolean(urlAppointmentId)}
              >
                <SelectTrigger id="appointmentSelect" className="w-full text-xs">
                  <SelectValue placeholder="Choose a completed appointment..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {eligibleAppointments.length === 0 ? (
                    <div className="py-3 text-center text-xs text-muted-foreground">
                      No completed appointments without prescription found
                    </div>
                  ) : (
                    eligibleAppointments.map((apt) => {
                      const patientName = apt.patient?.name ?? "Patient"
                      const scheduleTime = apt.schedule?.startDateTime
                        ? format(new Date(apt.schedule.startDateTime), "MMM dd, yyyy - hh:mm a")
                        : "N/A"
                      return (
                        <SelectItem key={apt.id} value={apt.id} className="text-xs">
                          {patientName} ({scheduleTime})
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Follow-up Date */}
            <div className="space-y-1.5">
              <Label htmlFor="followUpDate" className="text-xs font-semibold text-foreground">
                Follow-up Date (Optional)
              </Label>
              <Input
                id="followUpDate"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full text-xs"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Dynamic Medications Array */}
            <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Medications & Regimen</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Add pharmaceutical drugs, dosages, frequencies, and durations.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedication}
                  className="h-7 border-[#0B7285]/30 text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
                >
                  <Plus className="mr-1 size-3" />
                  Add Medication
                </Button>
              </div>

              <div className="space-y-2.5">
                {medications.map((med, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-card p-3 dark:border-neutral-700 sm:flex-row sm:items-center"
                  >
                    <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Medicine Name</Label>
                        <Input
                          placeholder="e.g. Amoxicillin"
                          value={med.name}
                          onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Dosage</Label>
                        <Input
                          placeholder="e.g. 500mg"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Frequency</Label>
                        <Input
                          placeholder="e.g. 1-0-1 (after food)"
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Duration</Label>
                        <Input
                          placeholder="e.g. 7 days"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMedication(index)}
                        className="size-8 self-end text-destructive hover:bg-destructive/10 sm:self-center"
                        title="Remove medication"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Instructions / Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="instructions" className="text-xs font-semibold text-foreground">
                Clinical Instructions & Patient Advice
              </Label>
              <Textarea
                id="instructions"
                rows={3}
                placeholder="Take medications after meals. Drink plenty of water and maintain adequate rest..."
                value={generalInstructions}
                onChange={(e) => setGeneralInstructions(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="gap-2 pt-2 sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <AppSubmitButton
                isPending={isPending}
                pendingLabel="Generating Prescription..."
                className="h-9 bg-[#0B7285] px-4 text-xs text-white hover:bg-[#095E70] w-auto"
              >
                Generate & Issue Prescription
              </AppSubmitButton>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePrescriptionModal
