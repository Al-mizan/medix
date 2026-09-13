import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Calendar, Edit2, FileDown, MoreHorizontal, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IPrescription } from "@/types/prescription.types"

const getInitials = (name?: string) => {
  if (!name) return "PT"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface GetDoctorPrescriptionsColumnsProps {
  onEdit: (prescription: IPrescription) => void
  onDelete: (prescription: IPrescription) => void
}

export const getDoctorPrescriptionsColumns = ({
  onEdit,
  onDelete,
}: GetDoctorPrescriptionsColumnsProps): ColumnDef<IPrescription>[] => [
  {
    id: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const patient = row.original.patient
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-neutral-200 dark:border-neutral-700">
            {patient?.profilePhoto && (
              <AvatarImage src={patient.profilePhoto} alt={patient?.name ?? "Patient"} />
            )}
            <AvatarFallback className="bg-[#0B7285]/10 text-xs font-semibold text-[#0B7285]">
              {getInitials(patient?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{patient?.name ?? "Unknown Patient"}</p>
            <p className="text-xs text-muted-foreground">{patient?.email ?? "No email"}</p>
          </div>
        </div>
      )
    },
  },
  {
    id: "appointmentDate",
    header: "Consultation Date",
    cell: ({ row }) => {
      const appointmentDate = row.original.appointment?.createdAt ?? row.original.createdAt
      const dateObj = new Date(appointmentDate)
      if (Number.isNaN(dateObj.getTime())) {
        return <span className="text-xs text-muted-foreground">N/A</span>
      }

      return (
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <Calendar className="size-3.5 text-[#0B7285]" />
          {format(dateObj, "MMM dd, yyyy")}
        </div>
      )
    },
  },
  {
    id: "createdAt",
    header: "Prescribed On",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt
      const dateObj = new Date(createdAt)
      if (Number.isNaN(dateObj.getTime())) {
        return <span className="text-xs text-muted-foreground">N/A</span>
      }

      return <span className="text-xs text-muted-foreground">{format(dateObj, "MMM dd, yyyy")}</span>
    },
  },
  {
    id: "followUpDate",
    header: "Follow-Up Date",
    cell: ({ row }) => {
      const followUp = row.original.followUpDate
      if (!followUp) {
        return <span className="text-xs text-muted-foreground">None</span>
      }
      const dateObj = new Date(followUp)
      if (Number.isNaN(dateObj.getTime())) {
        return <span className="text-xs text-muted-foreground">None</span>
      }

      return (
        <span className="rounded-md border border-[#0B7285]/20 bg-[#0B7285]/5 px-2 py-0.5 text-xs font-medium text-[#0B7285]">
          {format(dateObj, "MMM dd, yyyy")}
        </span>
      )
    },
  },
  {
    id: "pdfUrl",
    header: "Prescription PDF",
    cell: ({ row }) => {
      const pdfUrl = row.original.pdfUrl

      if (!pdfUrl) {
        return (
          <span className="flex items-center text-xs text-muted-foreground italic">
            Generating...
          </span>
        )
      }

      return (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 border-[#0B7285]/30 text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
        >
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <FileDown className="mr-1.5 size-3.5" />
            View PDF
          </a>
        </Button>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const prescription = row.original

      return (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(prescription)}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="mr-1 size-3.5 text-[#0B7285]" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Options</DropdownMenuLabel>
              {prescription.pdfUrl && (
                <DropdownMenuItem asChild className="text-xs cursor-pointer">
                  <a href={prescription.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <FileDown className="mr-2 size-3.5 text-[#0B7285]" />
                    Download PDF
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onEdit(prescription)}
                className="text-xs cursor-pointer"
              >
                <Edit2 className="mr-2 size-3.5 text-[#0B7285]" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(prescription)}
                className="text-xs cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
