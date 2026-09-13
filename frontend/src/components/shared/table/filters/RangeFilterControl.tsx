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

    const applyNow = () => {
        const hasAnyValue = RANGE_OPERATORS.some((operator) =>
            rangeValue[operator]?.trim(),
        );
        onFilterChange(filter.id, hasAnyValue ? rangeValue : undefined);
    };

    const clearRange = () => {
        setRangeValue({});
        onFilterChange(filter.id, undefined);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                {RANGE_OPERATORS.map((operator) => (
                    <div key={operator} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                            {RANGE_OPERATOR_LABEL[operator]}
                        </Label>
                        <Input
                            type="number"
                            value={rangeValue[operator] ?? ""}
                            onChange={(event) => {
                                const nextValue = event.target.value;
                                setRangeValue((prevValue) => ({
                                    ...prevValue,
                                    [operator]: nextValue,
                                }));
                            }}
                            placeholder="0"
                            disabled={isLoading}
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between gap-2">
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
                    disabled={isLoading}
                >
                    Apply
                </Button>
            </div>
        </div>
    );
}
