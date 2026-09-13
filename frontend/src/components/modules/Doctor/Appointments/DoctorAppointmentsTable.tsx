"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { changeDoctorAppointmentStatusAction } from "@/app/(dashboardLayout)/doctor/dashboard/appointments/_action";
import DataTable from "@/components/shared/table/DataTable";
import {
  DataTableFilterConfig,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import {
  serverManagedFilter,
  useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { getMyAppointments } from "@/services/appointment.services";
import { PaginationMeta } from "@/types/api.types";
import { AppointmentStatus, IAppointment } from "@/types/appointment.types";
import DoctorCompletedPromptDialog from "./DoctorCompletedPromptDialog";
import DoctorViewAppointmentDetailsDialog from "./DoctorViewAppointmentDetailsDialog";
import { getDoctorAppointmentsColumns } from "./doctorAppointmentsColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const APPOINTMENT_FILTER_DEFINITIONS = [
  serverManagedFilter.single("status"),
];

interface DoctorAppointmentsTableProps {
  initialQueryString?: string;
}

const DoctorAppointmentsTable = ({
  initialQueryString = "",
}: DoctorAppointmentsTableProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [completedAppointmentPrompt, setCompletedAppointmentPrompt] =
    useState<IAppointment | null>(null);
  const [viewingAppointment, setViewingAppointment] =
    useState<IAppointment | null>(null);
  const [pendingAppointmentId, setPendingAppointmentId] =
    useState<string | null>(null);

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
  });

  const queryString = queryStringFromUrl || initialQueryString;

  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({
      searchParams,
      updateParams,
    });

  const { filterValues, handleFilterChange, clearAllFilters } =
    useServerManagedDataTableFilters({
      searchParams,
      definitions: APPOINTMENT_FILTER_DEFINITIONS,
      updateParams,
    });

  const {
    data: appointmentsResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["my-appointments", queryString],
    queryFn: () => getMyAppointments(queryString),
  });

  const { mutateAsync: updateStatusMutation } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      changeDoctorAppointmentStatusAction(id, { status }),
  });

  const handleStatusTransition = async (
    appointment: IAppointment,
    targetStatus: AppointmentStatus,
  ) => {
    if (appointment.status === "COMPLETED" || appointment.status === "CANCELED") {
      toast.error(`Cannot modify appointment with status ${appointment.status}`);
      return;
    }

    if (appointment.status === "SCHEDULED" && targetStatus === "COMPLETED") {
      toast.error(
        "Cannot skip directly from SCHEDULED to COMPLETED. Start consultation first.",
      );
      return;
    }

    const isValidTransition =
      (appointment.status === "SCHEDULED" && targetStatus === "INPROGRESS") ||
      (appointment.status === "INPROGRESS" && targetStatus === "COMPLETED");

    if (!isValidTransition) {
      toast.error(
        `Invalid status transition from ${appointment.status} to ${targetStatus}.`,
      );
      return;
    }

    try {
      setPendingAppointmentId(appointment.id);
      const result = await updateStatusMutation({
        id: appointment.id,
        status: targetStatus,
      });

      if (!result.success) {
        toast.error(result.message || "Failed to update appointment status");
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["doctor-dashboard-data"] });

      if (targetStatus === "INPROGRESS") {
        toast.success("Consultation started!", {
          description: "Status is now INPROGRESS. You can join the video call room.",
        });
      } else if (targetStatus === "COMPLETED") {
        toast.success("Consultation marked as COMPLETED!", {
          description: "Would you like to write a prescription now?",
          action: {
            label: "Create Prescription",
            onClick: () =>
              router.push(
                `/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`,
              ),
          },
        });
        setCompletedAppointmentPrompt(appointment);
      }

      router.refresh();
    } catch {
      toast.error("An unexpected error occurred while updating status");
    } finally {
      setPendingAppointmentId(null);
    }
  };

  const rawAppointments = appointmentsResponse?.data ?? [];

  const filteredAppointments = useMemo(() => {
    let result = rawAppointments;

    if (searchTermFromUrl) {
      const term = searchTermFromUrl.toLowerCase().trim();
      result = result.filter(
        (apt) =>
          apt.patient?.name?.toLowerCase().includes(term) ||
          apt.patient?.email?.toLowerCase().includes(term) ||
          apt.patient?.contactNumber?.toLowerCase().includes(term),
      );
    }

    if (filterValues.status) {
      result = result.filter((apt) => apt.status === filterValues.status);
    }

    return result;
  }, [rawAppointments, searchTermFromUrl, filterValues.status]);

  const totalItems =
    appointmentsResponse?.meta?.total ?? filteredAppointments.length;
  const totalPages =
    appointmentsResponse?.meta?.totalPages ??
    Math.max(1, Math.ceil(totalItems / optimisticPaginationState.pageSize));

  const paginatedData = useMemo(() => {
    if (appointmentsResponse?.meta) {
      return appointmentsResponse.data;
    }
    const start =
      optimisticPaginationState.pageIndex *
      optimisticPaginationState.pageSize;
    return filteredAppointments.slice(
      start,
      start + optimisticPaginationState.pageSize,
    );
  }, [
    appointmentsResponse?.meta,
    appointmentsResponse?.data,
    filteredAppointments,
    optimisticPaginationState,
  ]);

  const meta: PaginationMeta = {
    page: optimisticPaginationState.pageIndex + 1,
    limit: optimisticPaginationState.pageSize,
    total: totalItems,
    totalPages,
  };

  const filterConfigs: DataTableFilterConfig[] = useMemo(
    () => [
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
    ],
    [],
  );

  const filterValuesForTable: DataTableFilterValues = useMemo(
    () => ({
      status: filterValues.status,
    }),
    [filterValues],
  );

  const columns = useMemo(
    () =>
      getDoctorAppointmentsColumns({
        pendingAppointmentId,
        onStatusTransition: handleStatusTransition,
        onViewDetails: (apt) => setViewingAppointment(apt),
      }),
    [pendingAppointmentId],
  );

  const scheduledCount = rawAppointments.filter((a) => a.status === "SCHEDULED").length;
  const inProgressCount = rawAppointments.filter((a) => a.status === "INPROGRESS").length;
  const completedCount = rawAppointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Appointments Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your patient consultations and follow strict clinical workflow transitions.
          </p>
        </div>

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

      <DoctorCompletedPromptDialog
        appointment={completedAppointmentPrompt}
        onClose={() => setCompletedAppointmentPrompt(null)}
      />

      <DoctorViewAppointmentDetailsDialog
        appointment={viewingAppointment}
        onClose={() => setViewingAppointment(null)}
      />
    </>
  );
};

export default DoctorAppointmentsTable;
