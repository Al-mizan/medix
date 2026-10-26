"use client";

import DataTableFilters, {
  DataTableFilterConfig,
  DataTableFilterValue,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortingState } from "@tanstack/react-table";

interface DoctorsListToolbarProps {
  searchTermFromUrl: string;
  filterConfigs: DataTableFilterConfig[];
  filterValuesForControls: DataTableFilterValues;
  optimisticSortingState: SortingState;
  isBusy: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (id: string, value: DataTableFilterValue | undefined) => void;
  onClearAllFilters: () => void;
  onSortingChange: (sorting: SortingState) => void;
}

export default function DoctorsListToolbar({
  searchTermFromUrl,
  filterConfigs,
  filterValuesForControls,
  optimisticSortingState,
  isBusy,
  onSearchChange,
  onFilterChange,
  onClearAllFilters,
  onSortingChange,
}: DoctorsListToolbarProps) {
  const currentSortValue = optimisticSortingState[0]?.id
    ? `${optimisticSortingState[0]?.id}:${optimisticSortingState[0]?.desc ? "desc" : "asc"}`
    : "default";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <DataTableSearch
          key={searchTermFromUrl}
          initialValue={searchTermFromUrl}
          placeholder="Search by doctor name, specialty, or hospital..."
          debounceMs={300}
          onDebouncedChange={onSearchChange}
          isLoading={isBusy}
        />

        <DataTableFilters
          filters={filterConfigs}
          values={filterValuesForControls}
          onFilterChange={onFilterChange}
          onClearAll={onClearAllFilters}
          isLoading={isBusy}
        />

        <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
          <span className="text-sm font-medium text-muted-foreground">Sort</span>
          <Select
            value={currentSortValue}
            onValueChange={(value) => {
              if (value === "default") {
                onSortingChange([]);
                return;
              }

              const [sortBy, sortOrder] = value.split(":");
              onSortingChange([{ id: sortBy, desc: sortOrder === "desc" }]);
            }}
          >
            <SelectTrigger className="w-48 sm:w-52" disabled={isBusy}>
              <SelectValue placeholder="Sort doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="averageRating:desc">
                Rating (High to Low)
              </SelectItem>
              <SelectItem value="appointmentFee:asc">
                Fee (Low to High)
              </SelectItem>
              <SelectItem value="experience:desc">
                Experience (High to Low)
              </SelectItem>
              <SelectItem value="createdAt:desc">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
