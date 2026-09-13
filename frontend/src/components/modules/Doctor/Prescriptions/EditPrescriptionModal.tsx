"use client"

import { updatePrescriptionAction } from "@/app/(dashboardLayout)/doctor/dashboard/prescriptions/_action"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { IMedicationItem, IPrescription } from "@/types/prescription.types"
import {
  formatPrescriptionInstructions,
  parsePrescriptionInstructions,
} from "@/zod/prescription.validation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface EditPrescriptionModalProps {
  prescription: IPrescription | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyMedication: IMedicationItem = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
}

const EditPrescriptionModal = ({
  prescription,
  open,
  onOpenChange,
}: EditPrescriptionModalProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [followUpDate, setFollowUpDate] = useState<string>("")
  const [generalInstructions, setGeneralInstructions] = useState<string>("")
  const [medications, setMedications] = useState<IMedicationItem[]>([{ ...emptyMedication }])

  // Populate data when prescription changes
  useEffect(() => {
    if (prescription) {
      if (prescription.followUpDate) {
        const dateObj = new Date(prescription.followUpDate)
        if (!Number.isNaN(dateObj.getTime())) {
          setFollowUpDate(dateObj.toISOString().split("T")[0])
        }
      } else {
        setFollowUpDate("")
      }

      const { medications: parsedMeds, instructions: parsedNotes } =
        parsePrescriptionInstructions(prescription.instructions || "")

      if (parsedMeds.length > 0) {
        setMedications(parsedMeds)
      } else {
        setMedications([{ ...emptyMedication }])
      }

      setGeneralInstructions(parsedNotes || "")
    }
  }, [prescription])

  const { mutateAsync: updatePrescriptionMutation, isPending } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { instructions?: string; followUpDate?: string }
    }) => updatePrescriptionAction(id, payload),
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prescription) return

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
        instructions: formattedInstructions,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined,
      }

      const result = await updatePrescriptionMutation({
        id: prescription.id,
        payload,
      })

      if (!result.success) {
        toast.error(result.message || "Failed to update prescription")
        return
      }

      toast.success(result.message || "Prescription updated successfully!")
      onOpenChange(false)

      void queryClient.invalidateQueries({ queryKey: ["my-prescriptions"] })
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred while updating prescription")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-2xl gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Edit Prescription
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update medication regimens and instructions for{" "}
            <strong>{prescription?.patient?.name ?? "Patient"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(92vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            {/* Follow-up Date */}
            <div className="space-y-1.5">
              <Label htmlFor="editFollowUpDate" className="text-xs font-semibold text-foreground">
                Follow-up Date (Optional)
              </Label>
              <Input
                id="editFollowUpDate"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            {/* Dynamic Medications Array */}
            <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Medications & Regimen</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Modify doses, timings, and durations.
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

            {/* Additional Instructions */}
            <div className="space-y-1.5">
              <Label htmlFor="editInstructions" className="text-xs font-semibold text-foreground">
                Clinical Instructions & Patient Advice
              </Label>
              <Textarea
                id="editInstructions"
                rows={3}
                placeholder="Take medications after meals..."
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
                pendingLabel="Updating Prescription..."
                className="h-9 bg-[#0B7285] px-4 text-xs text-white hover:bg-[#095E70] w-auto"
              >
                Update Prescription
              </AppSubmitButton>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default EditPrescriptionModal
