"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
    DataTableFilterConfig,
    DataTableFilterValue,
    DataTableFilterValues,
    DataTableRangeValue,
    isRangeValue,
    RANGE_OPERATORS,
    RANGE_OPERATOR_LABEL,
} from "./DataTableFilterTypes";

interface ActiveBadge {
    key: string;
    label: string;
    onRemove: () => void;
}

interface ActiveFilterBadgesProps {
    filters: DataTableFilterConfig[];
    values: DataTableFilterValues;
    isLoading?: boolean;
    onFilterChange: (
        filterId: string,
        value: DataTableFilterValue | undefined,
    ) => void;
}

export default function ActiveFilterBadges({
    filters,
    values,
    isLoading,
    onFilterChange,
}: ActiveFilterBadgesProps) {
    const activeBadges = useMemo<ActiveBadge[]>(() => {
        const badges: ActiveBadge[] = [];
        for (const filter of filters) {
            const filterValue = values[filter.id];

            if (filter.type === "single-select") {
                if (typeof filterValue === "string" && filterValue.length > 0) {
                    const option = filter.options.find(
                        (o) => o.value === filterValue,
                    );
                    badges.push({
                        key: `${filter.id}:${filterValue}`,
                        label: `${filter.label}: ${option?.label ?? filterValue}`,
                        onRemove: () => onFilterChange(filter.id, undefined),
                    });
                }
            }

            if (filter.type === "multi-select" && Array.isArray(filterValue)) {
                for (const val of filterValue) {
                    const option = filter.options.find((o) => o.value === val);
                    badges.push({
                        key: `${filter.id}:${val}`,
                        label: `${filter.label}: ${option?.label ?? val}`,
                        onRemove: () => {
                            const next = (filterValue as string[]).filter(
                                (v) => v !== val,
                            );
                            onFilterChange(
                                filter.id,
                                next.length > 0 ? next : undefined,
                            );
                        },
                    });
                }
            }

            if (filter.type === "range" && isRangeValue(filterValue)) {
                const isFeeFilter = filter.id.toLowerCase().includes("fee");
                for (const op of RANGE_OPERATORS) {
                    const val = filterValue[op]?.trim();
                    if (val) {
                        const formattedVal = isFeeFilter && !isNaN(Number(val))
                            ? `৳ ${Number(val).toLocaleString("en-BD")} BDT`
                            : val;
                        badges.push({
                            key: `${filter.id}:${op}`,
                            label: `${filter.label}: ${RANGE_OPERATOR_LABEL[op]} ${formattedVal}`,
                            onRemove: () => {
                                const next: DataTableRangeValue = {
                                    ...filterValue,
                                    [op]: "",
                                };
                                const hasAny = RANGE_OPERATORS.some((o) =>
                                    next[o]?.trim(),
                                );
                                onFilterChange(
                                    filter.id,
                                    hasAny ? next : undefined,
                                );
                            },
                        });
                    }
                }
            }
        }
        return badges;
    }, [filters, values, onFilterChange]);

    if (activeBadges.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {activeBadges.map((badge) => (
                <Badge
                    key={badge.key}
                    variant="secondary"
                    className="flex items-center gap-1.5 py-1 px-2.5 text-xs rounded-full font-medium"
                >
                    <span>{badge.label}</span>
                    <button
                        type="button"
                        onClick={badge.onRemove}
                        disabled={isLoading}
                        className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground disabled:pointer-events-none min-h-[22px] min-w-[22px] flex items-center justify-center transition-colors"
                        aria-label={`Remove ${badge.label}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
        </div>
    );
}
