"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DataTableFilterValue,
    SingleSelectFilterConfig,
} from "./DataTableFilterTypes";

interface SingleSelectFilterControlProps {
    filter: SingleSelectFilterConfig;
    value: string;
    isLoading?: boolean;
    onFilterChange: (
        filterId: string,
        value: DataTableFilterValue | undefined,
    ) => void;
}

export default function SingleSelectFilterControl({
    filter,
    value,
    isLoading,
    onFilterChange,
}: SingleSelectFilterControlProps) {
    return (
        <div className="space-y-3">
            <Select
                value={value || "all"}
                onValueChange={(nextValue) => {
                    onFilterChange(
                        filter.id,
                        nextValue === "all" ? undefined : nextValue,
                    );
                }}
            >
                <SelectTrigger disabled={isLoading}>
                    <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
