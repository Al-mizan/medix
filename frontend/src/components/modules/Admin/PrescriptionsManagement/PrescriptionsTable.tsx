"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { getAllPrescriptions } from "@/services/prescription.services";
import { PaginationMeta } from "@/types/api.types";
import { IPrescription } from "@/types/prescription.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import AdminViewPrescriptionDialog from "./AdminViewPrescriptionDialog";
import { getPrescriptionsColumns } from "./prescriptionsColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

interface PrescriptionsTableProps {
    initialQueryString: string;
}

const PrescriptionsTable = ({ initialQueryString }: PrescriptionsTableProps) => {
    const searchParams = useSearchParams();

    const [viewingPrescription, setViewingPrescription] =
        useState<IPrescription | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleView = useCallback((prescription: IPrescription) => {
        setViewingPrescription(prescription);
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

    const {
        data: prescriptionsResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["prescriptions", queryString],
        queryFn: () => getAllPrescriptions(queryString),
    });

    const prescriptions = prescriptionsResponse?.data ?? [];
    const meta: PaginationMeta | undefined = prescriptionsResponse?.meta;

    const columns = useMemo(() => {
        return getPrescriptionsColumns({
            onView: handleView,
        });
    }, [handleView]);

    return (
        <>
            <DataTable
                data={prescriptions}
                columns={columns}
                isLoading={isLoading || isFetching || isRouteRefreshPending}
                emptyMessage="No prescriptions found."
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
                meta={meta}
            />

            <AdminViewPrescriptionDialog
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                prescription={viewingPrescription}
            />
        </>
    );
};

export default PrescriptionsTable;
