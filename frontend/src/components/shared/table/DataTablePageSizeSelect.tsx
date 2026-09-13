"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const DEFAULT_PAGE_SIZES = [1, 10, 20, 50, 100] as const;

export const isDefaultPageSize = (value: number) => {
    return DEFAULT_PAGE_SIZES.includes(
        value as (typeof DEFAULT_PAGE_SIZES)[number],
    );
};

interface DataTablePageSizeSelectProps {
    pageSize: number;
    totalRows?: number;
    computedTotalPages: number;
    isLoading?: boolean;
    onPageSizeChange: (newPageSize: number) => void;
}

export default function DataTablePageSizeSelect({
    pageSize,
    totalRows,
    computedTotalPages,
    isLoading,
    onPageSizeChange,
}: DataTablePageSizeSelectProps) {
    const [isCustomMode, setIsCustomMode] = useState<boolean>(
        !isDefaultPageSize(pageSize),
    );
    const [customPageSize, setCustomPageSize] = useState<string>(
        String(pageSize),
    );

    const isCurrentPageSizeCustom = !isDefaultPageSize(pageSize);
    const showCustomInput = isCustomMode || isCurrentPageSizeCustom;
    const pageSizeSelectValue = showCustomInput ? "custom" : String(pageSize);

    const applyCustomPageSize = () => {
        const parsed = Number(customPageSize);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            return;
        }

        setIsCustomMode(!isDefaultPageSize(parsed));
        onPageSizeChange(parsed);
    };

    const onPageSizeSelect = (value: string) => {
        if (value === "custom") {
            setIsCustomMode(true);
            setCustomPageSize(String(pageSize));
            return;
        }

        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            return;
        }

        setIsCustomMode(false);
        setCustomPageSize(String(parsed));
        onPageSizeChange(parsed);
    };

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Select
                value={pageSizeSelectValue}
                onValueChange={onPageSizeSelect}
            >
                <SelectTrigger className="w-24" aria-label="Rows per page">
                    <SelectValue placeholder="Limit" />
                </SelectTrigger>

                <SelectContent>
                    {DEFAULT_PAGE_SIZES.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                            {size}
                        </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
            </Select>
            <span>rows</span>

            {showCustomInput && (
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min={1}
                        className="h-9 w-24"
                        value={customPageSize}
                        onChange={(event) =>
                            setCustomPageSize(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                applyCustomPageSize();
                            }
                        }}
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={applyCustomPageSize}
                        disabled={isLoading}
                    >
                        Apply
                    </Button>
                </div>
            )}

            <span className="ml-2">
                Total {totalRows ?? 0} items, {computedTotalPages} pages
            </span>
        </div>
    );
}
