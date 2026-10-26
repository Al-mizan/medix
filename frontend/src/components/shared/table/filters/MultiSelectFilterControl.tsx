"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOptions = filter.options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    );

    const applyNow = () => {
        onFilterChange(
            filter.id,
            selectedValues.length > 0 ? selectedValues : undefined,
        );
    };

    return (
        <div className="space-y-3">
            {filter.options.length > 5 && (
                <div className="relative">
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Filter ${filter.label.toLowerCase()}...`}
                        className="h-8 text-xs pr-7"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                        >
                            &times;
                        </button>
                    )}
                </div>
            )}

            <div className="max-h-52 space-y-2 overflow-auto pr-1">
                {filteredOptions.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                        No matches found
                    </p>
                ) : (
                    filteredOptions.map((option) => {
                        const checked = selectedValues.includes(option.value);

                        return (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-2 text-sm hover:text-primary transition-colors py-0.5"
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
                                <span className="text-xs font-medium text-foreground">{option.label}</span>
                            </label>
                        );
                    })
                )}
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
