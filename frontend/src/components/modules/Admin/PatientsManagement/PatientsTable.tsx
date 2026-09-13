"use client";

import DataTable from "@/components/shared/table/DataTable";
import {
    DataTableFilterConfig,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import {
    serverManagedFilter,
    useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { getAllPatients } from "@/services/adminPatient.services";
import { PaginationMeta } from "@/types/api.types";
import { IPatient } from "@/types/patient.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import DeletePatientConfirmationDialog from "./DeletePatientConfirmationDialog";
import { patientColumns } from "./patientsColumns";
import ViewPatientDialog from "./ViewPatientDialog";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const STATUS_FILTER_KEY = "user.status";

const PATIENT_FILTER_DEFINITIONS = [
    serverManagedFilter.single(STATUS_FILTER_KEY),
];

const PatientsTable = ({
    initialQueryString,
}: {
    initialQueryString: string;
}) => {
    const searchParams = useSearchParams();
    const {
        viewingItem,
        deletingItem,
        isViewDialogOpen,
        isDeleteDialogOpen,
        onViewOpenChange,
        onDeleteOpenChange,
        tableActions,
    } = useRowActionModalState<IPatient>({
        enableView: true,
        enableEdit: false,
        enableDelete: true,
    });

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
            definitions: PATIENT_FILTER_DEFINITIONS,
            updateParams,
        });

    const {
        data: patientDataResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["patients", queryString],
        queryFn: () => getAllPatients(queryString),
    });

    const patients = patientDataResponse?.data ?? [];
    const meta: PaginationMeta | undefined = patientDataResponse?.meta;

    const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
        return [
            {
                id: STATUS_FILTER_KEY,
                label: "Status",
                type: "single-select",
                options: [
                    { label: "Active", value: "ACTIVE" },
                    { label: "Blocked", value: "BLOCKED" },
                ],
            },
        ];
    }, []);

    const filterValuesForTable = useMemo<DataTableFilterValues>(() => {
        return {
            [STATUS_FILTER_KEY]: filterValues[STATUS_FILTER_KEY],
        };
    }, [filterValues]);

    return (
        <>
            <DataTable
                data={patients}
                columns={patientColumns}
                isLoading={isLoading || isFetching || isRouteRefreshPending}
                emptyMessage="No patients found."
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
                    placeholder: "Search patient by name, email, contact...",
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
                actions={tableActions}
            />

            <ViewPatientDialog
                open={isViewDialogOpen}
                onOpenChange={onViewOpenChange}
                patient={viewingItem}
            />

            <DeletePatientConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={onDeleteOpenChange}
                patient={deletingItem}
            />
        </>
    );
};

export default PatientsTable;
