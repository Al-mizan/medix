"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PaginationMeta } from "@/types/api.types";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
    DataTableFilterConfig,
    DataTableFilterValue,
    DataTableFilterValues,
} from "./DataTableFilters";
import DataTablePagination from "./DataTablePagination";
import DataTableLoadingOverlay from "./DataTableLoadingOverlay";
import DataTableToolbar from "./DataTableToolbar";
import { createActionsColumn, DataTableActions } from "./DataTableActionsColumn";

export type { DataTableActions };

interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    actions?: DataTableActions<TData>;
    toolbarAction?: React.ReactNode;
    emptyMessage?: string;
    isLoading?: boolean;
    sorting?: {
        state: SortingState;
        onSortingChange: (state: SortingState) => void;
    };
    pagination?: {
        state: PaginationState;
        onPaginationChange: (state: PaginationState) => void;
    };
    search?: {
        initialValue?: string;
        placeholder?: string;
        debounceMs?: number;
        onDebouncedChange: (value: string) => void;
    };
    filters?: {
        configs: DataTableFilterConfig[];
        values: DataTableFilterValues;
        onFilterChange: (
            filterId: string,
            value: DataTableFilterValue | undefined,
        ) => void;
        onClearAll?: () => void;
    };
    meta?: PaginationMeta;
}

const DataTable = <TData,>({
    data = [] as TData[],
    columns,
    actions,
    toolbarAction,
    emptyMessage,
    isLoading,
    sorting,
    pagination,
    search,
    filters,
    meta,
}: DataTableProps<TData>) => {
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    const hydratedIsLoading = hasHydrated ? Boolean(isLoading) : false;

    const tableColumns: ColumnDef<TData>[] = useMemo(() => {
        if (!actions) return columns;
        return [...columns, createActionsColumn(actions)];
    }, [columns, actions]);

    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is intentionally used here
    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualSorting: !!sorting,
        manualPagination: !!pagination,
        pageCount: pagination ? Math.max(meta?.totalPages ?? 0, 0) : undefined,
        state: {
            ...(sorting ? { sorting: sorting.state } : {}),
            ...(pagination ? { pagination: pagination.state } : {}),
        },
        onSortingChange: sorting
            ? (updater) => {
                  const current = sorting.state;
                  const next = typeof updater === "function" ? updater(current) : updater;
                  sorting.onSortingChange(next);
              }
            : undefined,
        onPaginationChange: pagination
            ? (updater) => {
                  const current = pagination.state;
                  const next = typeof updater === "function" ? updater(current) : updater;
                  pagination.onPaginationChange(next);
              }
            : undefined,
    });

    return (
        <div className="relative">
            {hydratedIsLoading && <DataTableLoadingOverlay />}

            <DataTableToolbar
                search={search}
                filters={filters}
                toolbarAction={toolbarAction}
                isLoading={hydratedIsLoading}
            />

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                            <Button
                                                variant="ghost"
                                                className="h-auto cursor-pointer p-0 font-semibold hover:bg-transparent hover:text-inherit focus-visible:ring-0"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getIsSorted() === "asc" ? (
                                                    <ArrowUp className="ml-1 h-4 w-4" />
                                                ) : header.column.getIsSorted() === "desc" ? (
                                                    <ArrowDown className="ml-1 h-4 w-4" />
                                                ) : (
                                                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                                                )}
                                            </Button>
                                        ) : (
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel()?.rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={tableColumns.length}
                                    className="h-24 text-center"
                                >
                                    {emptyMessage || "No data available."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {pagination && (
                    <DataTablePagination
                        table={table}
                        totalPages={meta?.totalPages}
                        totalRows={meta?.total}
                        isLoading={hydratedIsLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default DataTable;
