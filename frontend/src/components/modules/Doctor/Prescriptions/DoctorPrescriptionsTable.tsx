"use client"

import { deletePrescriptionAction } from "@/app/(dashboardLayout)/doctor/dashboard/prescriptions/_action"
import DataTable from "@/components/shared/table/DataTable"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable"
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch"
import { getMyPrescriptions } from "@/services/prescription.services"
import { PaginationMeta } from "@/types/api.types"
import { IPrescription } from "@/types/prescription.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  Calendar,
  Edit2,
  FileDown,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import CreatePrescriptionModal from "./CreatePrescriptionModal"
import EditPrescriptionModal from "./EditPrescriptionModal"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

const getInitials = (name?: string) => {
  if (!name) return "PT"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface DoctorPrescriptionsTableProps {
  initialQueryString?: string
}

const DoctorPrescriptionsTable = ({
  initialQueryString = "",
}: DoctorPrescriptionsTableProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Modal states
  const [editingPrescription, setEditingPrescription] = useState<IPrescription | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingPrescription, setDeletingPrescription] = useState<IPrescription | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const {
    queryStringFromUrl,
    optimisticSortingState,
    optimisticPaginationState,
    isRouteRefreshPending,
    updateParams,
    handleSortingChange,
    handlePaginationChange,
  } = useServerManagedDataTable({
    searchParams,
    defaultPage: DEFAULT_PAGE,
    defaultLimit: DEFAULT_LIMIT,
  })

  const queryString = queryStringFromUrl || initialQueryString

  const {
    searchTermFromUrl,
    handleDebouncedSearchChange,
  } = useServerManagedDataTableSearch({
    searchParams,
    updateParams,
  })

  const { data: prescriptionsResponse, isLoading, isFetching } = useQuery({
    queryKey: ["my-prescriptions", queryString],
    queryFn: () => getMyPrescriptions(queryString),
  })

  const { mutateAsync: deletePrescriptionMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deletePrescriptionAction(id),
  })

  const handleDelete = async () => {
    if (!deletingPrescription) return

    try {
      const result = await deletePrescriptionMutation(deletingPrescription.id)

      if (!result.success) {
        toast.error(result.message || "Failed to delete prescription")
        return
      }

      toast.success(result.message || "Prescription deleted successfully")
      setIsDeleteOpen(false)
      setDeletingPrescription(null)

      void queryClient.invalidateQueries({ queryKey: ["my-prescriptions"] })
      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred while deleting prescription")
    }
  }

  // Filter & Paginate
  const rawPrescriptions = prescriptionsResponse?.data ?? []

  const filteredPrescriptions = useMemo(() => {
    let result = rawPrescriptions

    if (searchTermFromUrl) {
      const term = searchTermFromUrl.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.patient?.name?.toLowerCase().includes(term) ||
          p.patient?.email?.toLowerCase().includes(term) ||
          p.instructions?.toLowerCase().includes(term)
      )
    }

    return result
  }, [rawPrescriptions, searchTermFromUrl])

  const totalItems = prescriptionsResponse?.meta?.total ?? filteredPrescriptions.length
  const totalPages =
    prescriptionsResponse?.meta?.totalPages ??
    Math.max(1, Math.ceil(totalItems / optimisticPaginationState.pageSize))

  const paginatedData = useMemo(() => {
    if (prescriptionsResponse?.meta) {
      return prescriptionsResponse.data
    }
    const pageIndex = optimisticPaginationState.pageIndex
    const pageSize = optimisticPaginationState.pageSize
    return filteredPrescriptions.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
  }, [prescriptionsResponse?.meta, prescriptionsResponse?.data, filteredPrescriptions, optimisticPaginationState])

  const meta: PaginationMeta = {
    page: optimisticPaginationState.pageIndex + 1,
    limit: optimisticPaginationState.pageSize,
    total: totalItems,
    totalPages,
  }

  const columns: ColumnDef<IPrescription>[] = useMemo(
    () => [
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
                onClick={() => {
                  setEditingPrescription(prescription)
                  setIsEditOpen(true)
                }}
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
                    onClick={() => {
                      setEditingPrescription(prescription)
                      setIsEditOpen(true)
                    }}
                    className="text-xs cursor-pointer"
                  >
                    <Edit2 className="mr-2 size-3.5 text-[#0B7285]" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setDeletingPrescription(prescription)
                      setIsDeleteOpen(true)
                    }}
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
    ],
    []
  )

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
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

        {/* Data Table */}
        <div className="rounded-2xl border bg-card p-3 shadow-sm sm:p-4 dark:border-neutral-800">
          <DataTable
            data={paginatedData}
            columns={columns}
            isLoading={isLoading || isFetching || isRouteRefreshPending}
            emptyMessage="No prescriptions issued yet."
            sorting={{
              state: optimisticSortingState,
              onSortingChange: handleSortingChange,
            }}
            pagination={{
              state: optimisticPaginationState,
              onPaginationChange: handlePaginationChange,
            }}
            search={{
              initialValue: searchTermFromUrl,
              placeholder: "Search by patient name, medication, instruction...",
              debounceMs: 500,
              onDebouncedChange: handleDebouncedSearchChange,
            }}
            meta={meta}
          />
        </div>
      </div>

      {/* Edit Prescription Modal */}
      <EditPrescriptionModal
        prescription={editingPrescription}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prescription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prescription for{" "}
              <strong>{deletingPrescription?.patient?.name ?? "this patient"}</strong>? This action
              will permanently remove the prescription and delete its associated PDF.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Prescription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default DoctorPrescriptionsTable
