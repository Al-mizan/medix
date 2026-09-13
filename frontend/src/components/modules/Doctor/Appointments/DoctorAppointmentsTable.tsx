"use client"

import { changeDoctorAppointmentStatusAction } from "@/app/(dashboardLayout)/doctor/dashboard/appointments/_action"
import DataTable from "@/components/shared/table/DataTable"
import {
  DataTableFilterConfig,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable"
import {
  serverManagedFilter,
  useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters"
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch"
import { getMyAppointments } from "@/services/appointment.services"
import { PaginationMeta } from "@/types/api.types"
import { AppointmentStatus, IAppointment } from "@/types/appointment.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FilePlus,
  Loader2,
  MoreHorizontal,
  Play,
  User,
  Video,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

const APPOINTMENT_FILTER_DEFINITIONS = [
  serverManagedFilter.single("status"),
]

const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case "SCHEDULED":
      return "border-[#0B7285]/30 bg-[#0B7285]/10 text-[#0B7285] dark:bg-[#0B7285]/20"
    case "INPROGRESS":
      return "border-[#E3A130]/30 bg-[#E3A130]/10 text-[#7A4A09] dark:text-[#E3A130] dark:bg-[#E3A130]/20"
    case "COMPLETED":
      return "border-[#178A5E]/30 bg-[#178A5E]/10 text-[#178A5E] dark:bg-[#178A5E]/20"
    case "CANCELED":
      return "border-[#D8464B]/30 bg-[#D8464B]/10 text-[#D8464B] dark:bg-[#D8464B]/20"
    default:
      return "border-muted bg-muted/40 text-muted-foreground"
  }
}

const getPaymentBadgeClass = (status?: string) => {
  switch (status) {
    case "PAID":
      return "border-[#178A5E]/30 bg-[#178A5E]/10 text-[#178A5E] dark:bg-[#178A5E]/20"
    case "UNPAID":
      return "border-neutral-300 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
    case "FAILED":
      return "border-[#D8464B]/30 bg-[#D8464B]/10 text-[#D8464B] dark:bg-[#D8464B]/20"
    default:
      return "border-muted bg-muted/40 text-muted-foreground"
  }
}

const getInitials = (name?: string) => {
  if (!name) return "PT"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface DoctorAppointmentsTableProps {
  initialQueryString?: string
}

const DoctorAppointmentsTable = ({ initialQueryString = "" }: DoctorAppointmentsTableProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Modal states
  const [completedAppointmentPrompt, setCompletedAppointmentPrompt] = useState<IAppointment | null>(null)
  const [viewingAppointment, setViewingAppointment] = useState<IAppointment | null>(null)
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null)

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

  const {
    filterValues,
    handleFilterChange,
    clearAllFilters,
  } = useServerManagedDataTableFilters({
    searchParams,
    definitions: APPOINTMENT_FILTER_DEFINITIONS,
    updateParams,
  })

  const { data: appointmentsResponse, isLoading, isFetching } = useQuery({
    queryKey: ["my-appointments", queryString],
    queryFn: () => getMyAppointments(queryString),
  })

  const { mutateAsync: updateStatusMutation } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      changeDoctorAppointmentStatusAction(id, { status }),
  })

  const handleStatusTransition = async (
    appointment: IAppointment,
    targetStatus: AppointmentStatus
  ) => {
    // Enforce strict FSM transition rules locally before sending
    if (appointment.status === "COMPLETED" || appointment.status === "CANCELED") {
      toast.error(`Cannot modify appointment with status ${appointment.status}`)
      return
    }

    if (appointment.status === "SCHEDULED" && targetStatus === "COMPLETED") {
      toast.error("Cannot skip directly from SCHEDULED to COMPLETED. Start consultation first.")
      return
    }

    const isValidTransition =
      (appointment.status === "SCHEDULED" && targetStatus === "INPROGRESS") ||
      (appointment.status === "INPROGRESS" && targetStatus === "COMPLETED")

    if (!isValidTransition) {
      toast.error(
        `Invalid status transition from ${appointment.status} to ${targetStatus}.`
      )
      return
    }

    try {
      setPendingAppointmentId(appointment.id)
      const result = await updateStatusMutation({ id: appointment.id, status: targetStatus })

      if (!result.success) {
        toast.error(result.message || "Failed to update appointment status")
        return
      }

      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
      void queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-data"] })

      if (targetStatus === "INPROGRESS") {
        toast.success("Consultation started!", {
          description: "Status is now INPROGRESS. You can join the video call room.",
        })
      } else if (targetStatus === "COMPLETED") {
        toast.success("Consultation marked as COMPLETED!", {
          description: "Would you like to write a prescription now?",
          action: {
            label: "Create Prescription",
            onClick: () => router.push(`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`),
          },
        })
        // Prompt dialog to create prescription
        setCompletedAppointmentPrompt(appointment)
      }

      router.refresh()
    } catch {
      toast.error("An unexpected error occurred while updating status")
    } finally {
      setPendingAppointmentId(null)
    }
  }

  // Filter & Paginate
  const rawAppointments = appointmentsResponse?.data ?? []

  const filteredAppointments = useMemo(() => {
    let result = rawAppointments

    if (searchTermFromUrl) {
      const term = searchTermFromUrl.toLowerCase().trim()
      result = result.filter(
        (apt) =>
          apt.patient?.name?.toLowerCase().includes(term) ||
          apt.patient?.email?.toLowerCase().includes(term) ||
          apt.patient?.contactNumber?.toLowerCase().includes(term)
      )
    }

    if (filterValues.status) {
      result = result.filter((apt) => apt.status === filterValues.status)
    }

    return result
  }, [rawAppointments, searchTermFromUrl, filterValues.status])

  const totalItems = appointmentsResponse?.meta?.total ?? filteredAppointments.length
  const totalPages =
    appointmentsResponse?.meta?.totalPages ??
    Math.max(1, Math.ceil(totalItems / optimisticPaginationState.pageSize))

  const paginatedData = useMemo(() => {
    if (appointmentsResponse?.meta) {
      return appointmentsResponse.data
    }
    const pageIndex = optimisticPaginationState.pageIndex
    const pageSize = optimisticPaginationState.pageSize
    return filteredAppointments.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
  }, [appointmentsResponse?.meta, appointmentsResponse?.data, filteredAppointments, optimisticPaginationState])

  const meta: PaginationMeta = {
    page: optimisticPaginationState.pageIndex + 1,
    limit: optimisticPaginationState.pageSize,
    total: totalItems,
    totalPages,
  }

  const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
    return [
      {
        id: "status",
        label: "Appointment Status",
        type: "single-select",
        options: [
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "In Progress", value: "INPROGRESS" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Canceled", value: "CANCELED" },
        ],
      },
    ]
  }, [])

  const filterValuesForTable = useMemo<DataTableFilterValues>(() => {
    return {
      status: filterValues.status,
    }
  }, [filterValues])

  const columns: ColumnDef<IAppointment>[] = useMemo(
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
                <p className="text-xs text-muted-foreground">{patient?.email ?? "No email provided"}</p>
              </div>
            </div>
          )
        },
      },
      {
        id: "schedule",
        header: "Date & Time",
        cell: ({ row }) => {
          const schedule = row.original.schedule
          if (!schedule?.startDateTime) {
            return <span className="text-xs text-muted-foreground">Not scheduled</span>
          }

          const startDate = new Date(schedule.startDateTime)
          const endDate = schedule.endDateTime ? new Date(schedule.endDateTime) : null

          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Calendar className="size-3.5 text-[#0B7285]" />
                {format(startDate, "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3 text-muted-foreground" />
                {format(startDate, "hh:mm a")}
                {endDate && ` - ${format(endDate, "hh:mm a")}`}
              </div>
            </div>
          )
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status ?? "SCHEDULED"
          return (
            <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(status)}`}>
              {status}
            </Badge>
          )
        },
      },
      {
        id: "paymentStatus",
        accessorKey: "paymentStatus",
        header: "Payment",
        cell: ({ row }) => {
          const paymentStatus = row.original.paymentStatus ?? "UNPAID"
          return (
            <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-xs font-medium ${getPaymentBadgeClass(paymentStatus)}`}>
              {paymentStatus}
            </Badge>
          )
        },
      },
      {
        id: "consultation",
        header: "Video Call",
        cell: ({ row }) => {
          const appointment = row.original
          const isEligible = appointment.status === "SCHEDULED" || appointment.status === "INPROGRESS"

          if (!isEligible) {
            return <span className="text-xs text-muted-foreground">—</span>
          }

          return (
            <Button
              asChild
              size="sm"
              variant="outline"
              className={
                appointment.status === "INPROGRESS"
                  ? "h-8 border-[#E3A130]/40 bg-[#E3A130]/10 text-xs text-[#7A4A09] hover:bg-[#E3A130]/20"
                  : "h-8 border-[#0B7285]/30 text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
              }
            >
              <Link href={`/consultation/doctor/${appointment.id}`}>
                <Video className="mr-1.5 size-3.5" />
                {appointment.status === "INPROGRESS" ? "Join Room" : "Open Call"}
              </Link>
            </Button>
          )
        },
      },
      {
        id: "actions",
        header: "Status Action",
        cell: ({ row }) => {
          const appointment = row.original
          const isPending = pendingAppointmentId === appointment.id
          const status = appointment.status

          return (
            <div className="flex items-center gap-2">
              {/* SCHEDULED -> INPROGRESS */}
              {status === "SCHEDULED" && (
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusTransition(appointment, "INPROGRESS")}
                  className="h-8 bg-[#0B7285] px-3 text-xs text-white hover:bg-[#095E70]"
                >
                  {isPending ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Play className="mr-1.5 size-3.5" />
                  )}
                  Start Consultation
                </Button>
              )}

              {/* INPROGRESS -> COMPLETED */}
              {status === "INPROGRESS" && (
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusTransition(appointment, "COMPLETED")}
                  className="h-8 bg-[#178A5E] px-3 text-xs text-white hover:bg-[#0F6E4A]"
                >
                  {isPending ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 size-3.5" />
                  )}
                  Complete Consultation
                </Button>
              )}

              {/* COMPLETED State */}
              {status === "COMPLETED" && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 border-[#0B7285]/30 text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
                >
                  <Link href={`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`}>
                    <FilePlus className="mr-1.5 size-3.5" />
                    Prescription
                  </Link>
                </Button>
              )}

              {/* CANCELED State */}
              {status === "CANCELED" && (
                <span className="text-xs text-muted-foreground italic">Canceled</span>
              )}

              {/* Overflow dropdown for details */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Options</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setViewingAppointment(appointment)}
                    className="text-xs cursor-pointer"
                  >
                    <User className="mr-2 size-3.5 text-[#0B7285]" />
                    View Details
                  </DropdownMenuItem>

                  {status === "COMPLETED" && (
                    <DropdownMenuItem asChild className="text-xs cursor-pointer">
                      <Link href={`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`}>
                        <FilePlus className="mr-2 size-3.5 text-[#0B7285]" />
                        Issue Prescription
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {(status === "SCHEDULED" || status === "INPROGRESS") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="text-xs cursor-pointer">
                        <Link href={`/consultation/doctor/${appointment.id}`}>
                          <Video className="mr-2 size-3.5 text-[#0B7285]" />
                          Enter Video Room
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingAppointmentId]
  )

  const scheduledCount = rawAppointments.filter((a) => a.status === "SCHEDULED").length
  const inProgressCount = rawAppointments.filter((a) => a.status === "INPROGRESS").length
  const completedCount = rawAppointments.filter((a) => a.status === "COMPLETED").length

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Appointments Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your patient consultations and follow strict clinical workflow transitions.
          </p>
        </div>

        {/* Status quick counters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border bg-neutral-100/70 px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-neutral-800">
            Total: {meta.total}
          </div>
          <div className="rounded-full border border-[#0B7285]/30 bg-[#0B7285]/10 px-3 py-1 text-xs font-medium text-[#0B7285]">
            Scheduled: {scheduledCount}
          </div>
          <div className="rounded-full border border-[#E3A130]/30 bg-[#E3A130]/10 px-3 py-1 text-xs font-medium text-[#7A4A09] dark:text-[#E3A130]">
            In Progress: {inProgressCount}
          </div>
          <div className="rounded-full border border-[#178A5E]/30 bg-[#178A5E]/10 px-3 py-1 text-xs font-medium text-[#178A5E]">
            Completed: {completedCount}
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border bg-card p-3 shadow-sm sm:p-4 dark:border-neutral-800">
          <DataTable
            data={paginatedData}
            columns={columns}
            isLoading={isLoading || isFetching || isRouteRefreshPending}
            emptyMessage="No appointments found."
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
              placeholder: "Search by patient name, email, phone...",
              debounceMs: 500,
              onDebouncedChange: handleDebouncedSearchChange,
            }}
            filters={{
              configs: filterConfigs,
              values: filterValuesForTable,
              onFilterChange: handleFilterChange,
              onClearAll: clearAllFilters,
            }}
            meta={meta}
          />
        </div>
      </div>

      {/* Prescription Prompt Dialog on completing an appointment */}
      <Dialog
        open={Boolean(completedAppointmentPrompt)}
        onOpenChange={(open) => {
          if (!open) setCompletedAppointmentPrompt(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#178A5E]/10 text-[#178A5E]">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle>Consultation Completed</DialogTitle>
            <DialogDescription>
              The consultation with{" "}
              <strong className="text-foreground">
                {completedAppointmentPrompt?.patient?.name ?? "Patient"}
              </strong>{" "}
              has been marked as COMPLETED. Would you like to create a prescription for this patient now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompletedAppointmentPrompt(null)}
            >
              Do It Later
            </Button>
            <Button
              type="button"
              className="bg-[#0B7285] text-white hover:bg-[#095E70]"
              onClick={() => {
                const aptId = completedAppointmentPrompt?.id
                setCompletedAppointmentPrompt(null)
                if (aptId) {
                  router.push(`/doctor/dashboard/prescriptions?appointmentId=${aptId}`)
                }
              }}
            >
              <FilePlus className="mr-2 size-4" />
              Create Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Detail Dialog */}
      <Dialog
        open={Boolean(viewingAppointment)}
        onOpenChange={(open) => {
          if (!open) setViewingAppointment(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Reference ID: {viewingAppointment?.id}
            </DialogDescription>
          </DialogHeader>
          {viewingAppointment && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                <p className="font-semibold text-foreground mb-1">Patient Information</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Name: </span>
                    {viewingAppointment.patient?.name ?? "N/A"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Email: </span>
                    {viewingAppointment.patient?.email ?? "N/A"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Contact: </span>
                    {viewingAppointment.patient?.contactNumber ?? "N/A"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                <p className="font-semibold text-foreground mb-1">Schedule & Status</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Status: </span>
                    <Badge
                      variant="outline"
                      className={`text-[11px] ml-1 ${getStatusBadgeClass(viewingAppointment.status)}`}
                    >
                      {viewingAppointment.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Payment: </span>
                    <Badge
                      variant="outline"
                      className={`text-[11px] ml-1 ${getPaymentBadgeClass(viewingAppointment.paymentStatus)}`}
                    >
                      {viewingAppointment.paymentStatus}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-foreground">Scheduled Time: </span>
                    {viewingAppointment.schedule?.startDateTime
                      ? format(new Date(viewingAppointment.schedule.startDateTime), "PPpp")
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewingAppointment(null)}
            >
              Close
            </Button>
            {viewingAppointment?.status === "COMPLETED" && (
              <Button
                type="button"
                className="bg-[#0B7285] text-white hover:bg-[#095E70]"
                onClick={() => {
                  const aptId = viewingAppointment.id
                  setViewingAppointment(null)
                  router.push(`/doctor/dashboard/prescriptions?appointmentId=${aptId}`)
                }}
              >
                Create Prescription
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DoctorAppointmentsTable
