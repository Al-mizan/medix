import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CreatePrescriptionModal from "./CreatePrescriptionModal"

export default function DoctorPrescriptionsHeader() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Prescriptions Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Author and issue digital medical prescriptions with automated PDF generation.
        </p>
      </div>
      <CreatePrescriptionModal
        triggerButton={
          <Button className="bg-[#0B7285] text-white hover:bg-[#095E70] shrink-0">
            <Plus className="mr-1.5 size-4" />
            Issue Prescription
          </Button>
        }
      />
    </div>
  )
}
