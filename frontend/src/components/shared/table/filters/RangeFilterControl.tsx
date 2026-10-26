"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DataTableFilterValue,
    DataTableRangeValue,
    RangeFilterConfig,
    RANGE_OPERATORS,
    RANGE_OPERATOR_LABEL,
} from "./DataTableFilterTypes";

interface RangeFilterControlProps {
    filter: RangeFilterConfig;
    value: DataTableRangeValue;
    isLoading?: boolean;
    onFilterChange: (
        filterId: string,
        value: DataTableFilterValue | undefined,
    ) => void;
}

export default function RangeFilterControl({
    filter,
    value,
    isLoading,
    onFilterChange,
}: RangeFilterControlProps) {
    const [rangeValue, setRangeValue] = useState<DataTableRangeValue>(value);

    const minVal = rangeValue.gte ? Number(rangeValue.gte) : null;
    const maxVal = rangeValue.lte ? Number(rangeValue.lte) : null;
    const isInvalidRange = minVal !== null && maxVal !== null && minVal > maxVal;

    const applyNow = () => {
        if (isInvalidRange) return;
        const hasAnyValue = RANGE_OPERATORS.some((operator) =>
            rangeValue[operator]?.trim(),
        );
        onFilterChange(filter.id, hasAnyValue ? rangeValue : undefined);
    };

    const clearRange = () => {
        setRangeValue({});
        onFilterChange(filter.id, undefined);
    };

    const setPreset = (gte?: string, lte?: string) => {
        const next: DataTableRangeValue = {};
        if (gte) next.gte = gte;
        if (lte) next.lte = lte;
        setRangeValue(next);
        onFilterChange(filter.id, Object.keys(next).length > 0 ? next : undefined);
    };

    return (
        <div className="space-y-3">
            {/* Quick Presets for Common BDT Consultation Fees */}
            <div className="flex flex-wrap gap-1.5 pb-1 border-b border-border/60">
                <button
                    type="button"
                    onClick={() => setPreset(undefined, "500")}
                    disabled={isLoading}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors disabled:pointer-events-none"
                >
                    &le; ৳500
                </button>
                <button
                    type="button"
                    onClick={() => setPreset("500", "1500")}
                    disabled={isLoading}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors disabled:pointer-events-none"
                >
                    ৳500 &ndash; ৳1,500
                </button>
                <button
                    type="button"
                    onClick={() => setPreset("1500", undefined)}
                    disabled={isLoading}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors disabled:pointer-events-none"
                >
                    &ge; ৳1,500
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {RANGE_OPERATORS.map((operator) => (
                    <div key={operator} className="space-y-1">
                        <Label className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>{RANGE_OPERATOR_LABEL[operator]}</span>
                            <span className="text-[10px] font-semibold text-text-muted">৳ BDT</span>
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            step="100"
                            value={rangeValue[operator] ?? ""}
                            onChange={(event) => {
                                const nextValue = event.target.value;
                                setRangeValue((prevValue) => ({
                                    ...prevValue,
                                    [operator]: nextValue,
                                }));
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !isInvalidRange) {
                                    applyNow();
                                }
                            }}
                            placeholder={operator === "gte" ? "300" : "3000"}
                            disabled={isLoading}
                            className={isInvalidRange ? "border-danger focus-visible:ring-danger" : ""}
                        />
                    </div>
                ))}
            </div>

            {isInvalidRange && (
                <p className="text-xs text-danger font-medium">
                    Min fee cannot be higher than max fee.
                </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={clearRange}
                    disabled={isLoading}
                >
                    Clear
                </Button>

                <Button
                    type="button"
                    size="sm"
                    onClick={applyNow}
                    disabled={isLoading || isInvalidRange}
                >
                    Apply
                </Button>
            </div>
        </div>
    );
}
