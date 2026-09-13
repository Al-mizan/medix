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
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <DataTableSearch
          key={searchTermFromUrl}
          initialValue={searchTermFromUrl}
          placeholder="Search doctor by name, qualification, email..."
          debounceMs={700}
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

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort</span>
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
            <SelectTrigger className="w-55" disabled={isBusy}>
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
