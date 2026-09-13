"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table as TanstackTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DataTablePageSizeSelect from "./DataTablePageSizeSelect";

type PaginationToken = number | "start-ellipsis" | "end-ellipsis";

const getPaginationItems = (
    currentPage: number,
    totalPages: number,
): PaginationToken[] => {
    if (totalPages <= 0) {
        return [];
    }

    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 5) {
        return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 4) {
        return [
            1,
            "start-ellipsis",
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [
        1,
        "start-ellipsis",
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
        "end-ellipsis",
        totalPages,
    ];
};

interface DataTablePaginationProps<TData> {
    table: TanstackTable<TData>;
    totalRows?: number;
    totalPages?: number;
    isLoading?: boolean;
}

const DataTablePagination = <TData,>({
    table,
    totalRows,
    totalPages,
    isLoading,
}: DataTablePaginationProps<TData>) => {
    const pagination = table.getState().pagination;
    const pageSize = pagination.pageSize;
    const currentPage = pagination.pageIndex + 1;
    const computedTotalPages = totalPages ?? table.getPageCount();

    const paginationItems = useMemo(
        () => getPaginationItems(currentPage, computedTotalPages),
        [currentPage, computedTotalPages],
    );

    const jumpBackwardTarget = Math.max(1, currentPage - 5);
    const jumpForwardTarget = Math.min(computedTotalPages, currentPage + 5);

    if (computedTotalPages <= 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || isLoading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                </Button>

                {paginationItems.map((item) => {
                    if (item === "start-ellipsis") {
                        return (
                            <Button
                                key="start-ellipsis"
                                variant="ghost"
                                size="sm"
                                className="min-w-9 px-2"
                                onClick={() =>
                                    table.setPageIndex(jumpBackwardTarget - 1)
                                }
                                disabled={isLoading}
                            >
                                ...
                            </Button>
                        );
                    }

                    if (item === "end-ellipsis") {
                        return (
                            <Button
                                key="end-ellipsis"
                                variant="ghost"
                                size="sm"
                                className="min-w-9 px-2"
                                onClick={() =>
                                    table.setPageIndex(jumpForwardTarget - 1)
                                }
                                disabled={isLoading}
                            >
                                ...
                            </Button>
                        );
                    }

                    const isActive = item === currentPage;
                    return (
                        <Button
                            key={item}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "min-w-9",
                                isActive && "pointer-events-none",
                            )}
                            onClick={() => table.setPageIndex(item - 1)}
                            disabled={isLoading}
                        >
                            {item}
                        </Button>
                    );
                })}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || isLoading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <DataTablePageSizeSelect
                pageSize={pageSize}
                totalRows={totalRows}
                computedTotalPages={computedTotalPages}
                isLoading={isLoading}
                onPageSizeChange={(newPageSize) => {
                    table.setPagination({
                        pageIndex: 0,
                        pageSize: newPageSize,
                    });
                }}
            />
        </div>
    );
};

export default DataTablePagination;
