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
import { getAllDoctorSchedules } from "@/services/doctorSchedule.services";
import { PaginationMeta } from "@/types/api.types";
import { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { getDoctorSchedulesColumns } from "./doctorSchedulesColumns";
import ViewDoctorScheduleDialog from "./ViewDoctorScheduleDialog";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const DOCTOR_SCHEDULE_FILTER_DEFINITIONS = [
    serverManagedFilter.single("isBooked"),
];

interface DoctorSchedulesTableProps {
    initialQueryString: string;
}

const DoctorSchedulesTable = ({
    initialQueryString,
}: DoctorSchedulesTableProps) => {
    const searchParams = useSearchParams();

    // Dialog state
    const [viewingSchedule, setViewingSchedule] =
        useState<IDoctorSchedule | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleView = useCallback((schedule: IDoctorSchedule) => {
        setViewingSchedule(schedule);
        setIsViewOpen(true);
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
            definitions: DOCTOR_SCHEDULE_FILTER_DEFINITIONS,
            updateParams,
        });

    const {
        data: schedulesResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["doctor-schedules", queryString],
        queryFn: () => getAllDoctorSchedules(queryString),
    });

    const doctorSchedules = schedulesResponse?.data ?? [];
    const meta: PaginationMeta | undefined = schedulesResponse?.meta;

    const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
        return [
            {
                id: "isBooked",
                label: "Booking Status",
                type: "single-select",
                options: [
                    { label: "Booked", value: "true" },
                    { label: "Available", value: "false" },
                ],
            },
        ];
    }, []);

    const filterValuesForTable = useMemo<DataTableFilterValues>(() => {
        return {
            isBooked: filterValues.isBooked,
        };
    }, [filterValues]);

    const columns = useMemo(() => {
        return getDoctorSchedulesColumns({
            onView: handleView,
        });
    }, [handleView]);

    return (
        <>
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        Doctor Schedules Management
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitor doctor schedule slots, availability, and booked appointments.
                    </p>
                </div>

                <DataTable
                    data={doctorSchedules}
                    columns={columns}
                    isLoading={isLoading || isFetching || isRouteRefreshPending}
                    emptyMessage="No doctor schedules found."
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
                        placeholder: "Search by doctor name or ID...",
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
            </div>

            <ViewDoctorScheduleDialog
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                doctorSchedule={viewingSchedule}
            />
        </>
    );
};

export default DoctorSchedulesTable;
