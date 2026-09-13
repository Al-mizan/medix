"use client";

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
import { getAllAppointments } from "@/services/appointment.services";
import { PaginationMeta } from "@/types/api.types";
import { IAppointment } from "@/types/appointment.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { getAppointmentsColumns } from "./appointmentsColumns";
import CancelAppointmentConfirmationDialog from "./CancelAppointmentConfirmationDialog";
import ViewAppointmentDialog from "./ViewAppointmentDialog";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const APPOINTMENT_FILTER_DEFINITIONS = [
    serverManagedFilter.single("status"),
    serverManagedFilter.single("paymentStatus"),
];

interface AppointmentsTableProps {
    initialQueryString: string;
}

const AppointmentsTable = ({ initialQueryString }: AppointmentsTableProps) => {
    const searchParams = useSearchParams();

    // Dialog states
    const [viewingAppointment, setViewingAppointment] =
        useState<IAppointment | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const [cancelingAppointment, setCancelingAppointment] =
        useState<IAppointment | null>(null);
    const [isCancelOpen, setIsCancelOpen] = useState(false);

    const handleView = useCallback((appointment: IAppointment) => {
        setViewingAppointment(appointment);
        setIsViewOpen(true);
    }, []);

    const handleCancel = useCallback((appointment: IAppointment) => {
        setCancelingAppointment(appointment);
        setIsCancelOpen(true);
    }, []);

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
        queryKey: ["appointments", queryString],
        queryFn: () => getAllAppointments(queryString),
    });

    const appointments = appointmentsResponse?.data ?? [];
    const meta: PaginationMeta | undefined = appointmentsResponse?.meta;

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
            {
                id: "paymentStatus",
                label: "Payment Status",
                type: "single-select",
                options: [
                    { label: "Paid", value: "PAID" },
                    { label: "Unpaid", value: "UNPAID" },
                    { label: "Refunded", value: "REFUNDED" },
                    { label: "Failed", value: "FAILED" },
                ],
            },
        ];
    }, []);

    const filterValuesForTable = useMemo<DataTableFilterValues>(() => {
        return {
            status: filterValues.status,
            paymentStatus: filterValues.paymentStatus,
        };
    }, [filterValues]);

    const columns = useMemo(() => {
        return getAppointmentsColumns({
            onView: handleView,
            onCancel: handleCancel,
        });
    }, [handleView, handleCancel]);

    return (
        <>
            <DataTable
                data={appointments}
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
                    placeholder: "Search by patient or doctor name...",
                    debounceMs: 700,
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

            <ViewAppointmentDialog
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                appointment={viewingAppointment}
            />

            <CancelAppointmentConfirmationDialog
                open={isCancelOpen}
                onOpenChange={setIsCancelOpen}
                appointment={cancelingAppointment}
            />
        </>
    );
};

export default AppointmentsTable;
