"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DataTableFilterValue,
    MultiSelectFilterConfig,
} from "./DataTableFilterTypes";

interface MultiSelectFilterControlProps {
    filter: MultiSelectFilterConfig;
    value: string[];
    isLoading?: boolean;
    onFilterChange: (
        filterId: string,
        value: DataTableFilterValue | undefined,
    ) => void;
}

export default function MultiSelectFilterControl({
    filter,
    value,
    isLoading,
    onFilterChange,
}: MultiSelectFilterControlProps) {
    const [selectedValues, setSelectedValues] = useState<string[]>(value);

    const applyNow = () => {
        onFilterChange(
            filter.id,
            selectedValues.length > 0 ? selectedValues : undefined,
        );
    };

    return (
        <div className="space-y-3">
            <div className="max-h-52 space-y-2 overflow-auto pr-1">
                {filter.options.map((option) => {
                    const checked = selectedValues.includes(option.value);

                    return (
                        <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                            <Checkbox
                                checked={checked}
                                onCheckedChange={(checkedState) => {
                                    const nextValues = checkedState
                                        ? [...selectedValues, option.value]
                                        : selectedValues.filter(
                                              (item) => item !== option.value,
                                          );

                                    setSelectedValues(nextValues);
                                }}
                                disabled={isLoading}
                            />
                            <span>{option.label}</span>
                        </label>
                    );
                })}
            </div>

            <div className="flex items-center justify-between gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedValues([])}
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
