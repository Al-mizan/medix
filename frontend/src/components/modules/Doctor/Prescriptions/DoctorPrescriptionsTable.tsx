"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deletePrescriptionAction } from "@/app/(dashboardLayout)/doctor/dashboard/prescriptions/_action"
import DataTable from "@/components/shared/table/DataTable"
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable"
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch"
import { getMyPrescriptions } from "@/services/prescription.services"
import { PaginationMeta } from "@/types/api.types"
import { IPrescription } from "@/types/prescription.types"
import EditPrescriptionModal from "./EditPrescriptionModal"
import { getDoctorPrescriptionsColumns } from "./doctorPrescriptionsColumns"
import DeletePrescriptionAlertDialog from "./DeletePrescriptionAlertDialog"
import DoctorPrescriptionsHeader from "./DoctorPrescriptionsHeader"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

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
  } = useServerManagedDataTable({ searchParams, defaultPage: DEFAULT_PAGE, defaultLimit: DEFAULT_LIMIT })

  const queryString = queryStringFromUrl || initialQueryString
  const { searchTermFromUrl, handleDebouncedSearchChange } = useServerManagedDataTableSearch({ searchParams, updateParams })

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

  const columns = useMemo(
    () =>
      getDoctorPrescriptionsColumns({
        onEdit: (prescription) => {
          setEditingPrescription(prescription)
          setIsEditOpen(true)
        },
        onDelete: (prescription) => {
          setDeletingPrescription(prescription)
          setIsDeleteOpen(true)
        },
      }),
    []
  )

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <DoctorPrescriptionsHeader />

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
      <DeletePrescriptionAlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        prescription={deletingPrescription}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
    </>
  )
}

export default DoctorPrescriptionsTable
