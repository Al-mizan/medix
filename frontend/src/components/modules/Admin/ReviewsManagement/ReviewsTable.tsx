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
import { getAllReviews } from "@/services/review.services";
import { PaginationMeta } from "@/types/api.types";
import { IReview } from "@/types/review.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { getReviewsColumns } from "./reviewsColumns";
import ViewReviewDialog from "./ViewReviewDialog";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const REVIEW_FILTER_DEFINITIONS = [
    serverManagedFilter.single("rating"),
];

interface ReviewsTableProps {
    initialQueryString: string;
}

const ReviewsTable = ({ initialQueryString }: ReviewsTableProps) => {
    const searchParams = useSearchParams();

    const [viewingReview, setViewingReview] = useState<IReview | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleView = useCallback((review: IReview) => {
        setViewingReview(review);
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
            definitions: REVIEW_FILTER_DEFINITIONS,
            updateParams,
        });

    const {
        data: reviewsResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["reviews", queryString],
        queryFn: () => getAllReviews(queryString),
    });

    const reviews = reviewsResponse?.data ?? [];
    const meta: PaginationMeta | undefined = reviewsResponse?.meta;

    const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
        return [
            {
                id: "rating",
                label: "Rating",
                type: "single-select",
                options: [
                    { label: "5 Stars", value: "5" },
                    { label: "4 Stars", value: "4" },
                    { label: "3 Stars", value: "3" },
                    { label: "2 Stars", value: "2" },
                    { label: "1 Star", value: "1" },
                ],
            },
        ];
    }, []);

    const filterValuesForTable = useMemo<DataTableFilterValues>(() => {
        return {
            rating: filterValues.rating,
        };
    }, [filterValues]);

    const columns = useMemo(() => {
        return getReviewsColumns({
            onView: handleView,
        });
    }, [handleView]);

    return (
        <>
            <DataTable
                data={reviews}
                columns={columns}
                isLoading={isLoading || isFetching || isRouteRefreshPending}
                emptyMessage="No reviews found."
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
                    placeholder: "Search by patient name, doctor name, or comment...",
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

            <ViewReviewDialog
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                review={viewingReview}
            />
        </>
    );
};

export default ReviewsTable;
