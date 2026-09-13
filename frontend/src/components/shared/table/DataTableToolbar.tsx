"use client";

import React from "react";
import DataTableFilters, {
    DataTableFilterConfig,
    DataTableFilterValue,
    DataTableFilterValues,
} from "./DataTableFilters";
import DataTableSearch from "./DataTableSearch";

interface DataTableToolbarProps {
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
    toolbarAction?: React.ReactNode;
    isLoading?: boolean;
}

export default function DataTableToolbar({
    search,
    filters,
    toolbarAction,
    isLoading,
}: DataTableToolbarProps) {
    if (!search && !filters && !toolbarAction) {
        return null;
    }

    return (
        <div className="mb-4 flex flex-wrap items-start gap-3">
            {search && (
                <DataTableSearch
                    key={search.initialValue ?? ""}
                    initialValue={search.initialValue}
                    placeholder={search.placeholder}
                    debounceMs={search.debounceMs}
                    onDebouncedChange={search.onDebouncedChange}
                    isLoading={isLoading}
                />
            )}

            {filters && (
                <DataTableFilters
                    filters={filters.configs}
                    values={filters.values}
                    onFilterChange={filters.onFilterChange}
                    onClearAll={filters.onClearAll}
                    isLoading={isLoading}
                />
            )}

            {toolbarAction && (
                <div className="ml-auto shrink-0">{toolbarAction}</div>
            )}
        </div>
    );
}
