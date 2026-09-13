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
import { getAllPayments } from "@/services/payment.services";
import { PaginationMeta } from "@/types/api.types";
import { IPayment } from "@/types/payment.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { getPaymentsColumns } from "./paymentsColumns";
import ViewPaymentDialog from "./ViewPaymentDialog";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const PAYMENT_FILTER_DEFINITIONS = [
    serverManagedFilter.single("status"),
];

interface PaymentsTableProps {
    initialQueryString: string;
}

const PaymentsTable = ({ initialQueryString }: PaymentsTableProps) => {
    const searchParams = useSearchParams();

    // Dialog state
    const [viewingPayment, setViewingPayment] = useState<IPayment | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleView = useCallback((payment: IPayment) => {
        setViewingPayment(payment);
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
            definitions: PAYMENT_FILTER_DEFINITIONS,
            updateParams,
        });

    const {
        data: paymentsResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["payments", queryString],
        queryFn: () => getAllPayments(queryString),
    });

    const payments = paymentsResponse?.data ?? [];
    const meta: PaginationMeta | undefined = paymentsResponse?.meta;

    const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
        return [
            {
                id: "status",
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
        };
    }, [filterValues]);

    const columns = useMemo(() => {
        return getPaymentsColumns({
            onView: handleView,
        });
    }, [handleView]);

    return (
        <>
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        Payments Management
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track customer transactions, payment statuses, and downloadable invoices.
                    </p>
                </div>

                <DataTable
                    data={payments}
                    columns={columns}
                    isLoading={isLoading || isFetching || isRouteRefreshPending}
                    emptyMessage="No payments found."
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
                        placeholder: "Search by transaction ID...",
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

            <ViewPaymentDialog
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                payment={viewingPayment}
            />
        </>
    );
};

export default PaymentsTable;
