"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DataTableSearchProps {
    initialValue?: string;
    placeholder?: string;
    debounceMs?: number;
    isLoading?: boolean;
    onDebouncedChange: (value: string) => void;
}

const DataTableSearch = ({
    initialValue = "",
    placeholder = "Search...",
    debounceMs = 300,
    isLoading = false,
    onDebouncedChange,
}: DataTableSearchProps) => {
    const [value, setValue] = useState(initialValue);
    const debouncedValue = useDebounce(value, debounceMs);
    const isFirstRender = useRef(true);
    const lastReportedValue = useRef(initialValue.trim());

    // Sync external initialValue updates if value changed outside
    useEffect(() => {
        if (initialValue !== value && initialValue.trim() !== lastReportedValue.current) {
            setValue(initialValue);
            lastReportedValue.current = initialValue.trim();
        }
    }, [initialValue]);

    // Trigger debounced change after user pauses
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const normalized = debouncedValue.trim();
        if (normalized !== lastReportedValue.current) {
            lastReportedValue.current = normalized;
            onDebouncedChange(normalized);
        }
    }, [debouncedValue, onDebouncedChange]);

    const handleClear = () => {
        setValue("");
        lastReportedValue.current = "";
        onDebouncedChange("");
    };

    return (
        <div className="relative w-full md:max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        handleClear();
                    }
                }}
                placeholder={placeholder}
                className={`h-9 pl-9 ${isLoading && value.length > 0 ? "pr-14" : "pr-9"}`}
                aria-label={placeholder}
            />

            {isLoading && (
                <Loader2
                    data-testid="search-loading-spinner"
                    className={`text-muted-foreground pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 animate-spin ${
                        value.length > 0 ? "right-8" : "right-3"
                    }`}
                />
            )}

            {value.length > 0 && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 -translate-y-1/2 size-7 min-h-[28px] min-w-[28px] text-muted-foreground hover:text-foreground"
                    onClick={handleClear}
                    aria-label="Clear search"
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
};

export default DataTableSearch;
