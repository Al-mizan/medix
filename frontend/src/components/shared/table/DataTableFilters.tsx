"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import {
    DataTableFilterConfig,
    DataTableFilterOption,
    DataTableFilterValue,
    DataTableFilterValues,
    DataTableRangeValue,
    getFilterActiveCount,
    isRangeValue,
    MultiSelectFilterConfig,
    RangeFilterConfig,
    RangeOperator,
    SingleSelectFilterConfig,
} from "./filters/DataTableFilterTypes";
import MultiSelectFilterControl from "./filters/MultiSelectFilterControl";
import SingleSelectFilterControl from "./filters/SingleSelectFilterControl";
import RangeFilterControl from "./filters/RangeFilterControl";
import ActiveFilterBadges from "./filters/ActiveFilterBadges";

export type {
    DataTableFilterOption,
    RangeOperator,
    SingleSelectFilterConfig,
    MultiSelectFilterConfig,
    RangeFilterConfig,
    DataTableFilterConfig,
    DataTableRangeValue,
    DataTableFilterValue,
    DataTableFilterValues,
};

interface DataTableFiltersProps {
    filters: DataTableFilterConfig[];
    values: DataTableFilterValues;
    onFilterChange: (
        filterId: string,
        value: DataTableFilterValue | undefined,
    ) => void;
    onClearAll?: () => void;
    isLoading?: boolean;
}

const DataTableFilters = ({
    filters,
    values,
    onFilterChange,
    onClearAll,
    isLoading,
}: DataTableFiltersProps) => {
    const totalActiveFilters = useMemo(() => {
        return filters.reduce((totalCount, filter) => {
            return totalCount + getFilterActiveCount(filter, values[filter.id]);
        }, 0);
    }, [filters, values]);

    if (filters.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                {filters.map((filter) => {
                    const filterValue = values[filter.id];
                    const activeCount = getFilterActiveCount(
                        filter,
                        filterValue,
                    );
                    const triggerClass = cn(
                        "h-9",
                        activeCount > 0 && "border-primary text-primary",
                    );

                    return (
                        <Popover
                            key={`${filter.id}-${JSON.stringify(filterValue ?? null)}`}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={triggerClass}
                                    disabled={isLoading}
                                >
                                    {filter.label}
                                    {activeCount > 0 && (
                                        <Badge
                                            className="h-5 min-w-5 px-1.5"
                                            variant="secondary"
                                        >
                                            {activeCount}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent align="start" className="w-80">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">
                                        {filter.label}
                                    </h3>
                                </div>

                                {filter.type === "single-select" && (
                                    <SingleSelectFilterControl
                                        filter={filter}
                                        value={
                                            typeof filterValue === "string"
                                                 ? filterValue
                                                : ""
                                        }
                                        isLoading={isLoading}
                                        onFilterChange={onFilterChange}
                                    />
                                )}

                                {filter.type === "multi-select" && (
                                    <MultiSelectFilterControl
                                        filter={filter}
                                        value={
                                            Array.isArray(filterValue)
                                                ? filterValue
                                                : []
                                        }
                                        isLoading={isLoading}
                                        onFilterChange={onFilterChange}
                                    />
                                )}

                                {filter.type === "range" && (
                                    <RangeFilterControl
                                        filter={filter}
                                        value={
                                            isRangeValue(filterValue)
                                                ? filterValue
                                                : {}
                                        }
                                        isLoading={isLoading}
                                        onFilterChange={onFilterChange}
                                    />
                                )}
                            </PopoverContent>
                        </Popover>
                    );
                })}

                {onClearAll && totalActiveFilters > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-9"
                        onClick={onClearAll}
                        disabled={isLoading}
                    >
                        <X className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}

                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span>{totalActiveFilters} active</span>
                </div>
            </div>

            <ActiveFilterBadges
                filters={filters}
                values={values}
                isLoading={isLoading}
                onFilterChange={onFilterChange}
            />
        </div>
    );
};

export default DataTableFilters;
