"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllSpecialties, getDoctors } from "@/services/doctor.services";
import { type IDoctor } from "@/types/doctor.types";
import { type ISpecialty } from "@/types/specialty.types";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import {
  serverManagedFilter,
  useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import {
  DataTableFilterConfig,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import DoctorConsultationCard from "./DoctorConsultationCard";
import ConsultationPagination from "./ConsultationPagination";
import DoctorsListToolbar from "./DoctorsListToolbar";
import DoctorListSkeleton from "@/components/modules/DoctorListSkeleton";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const SPECIALTIES_FILTER_KEY = "specialties.specialty.title";
const APPOINTMENT_FEE_FILTER_KEY = "appointmentFee";
const CONSULTATION_ALLOWED_QUERY_KEYS = new Set([
  "page",
  "limit",
  "sortBy",
  "sortOrder",
  "searchTerm",
  "gender",
  SPECIALTIES_FILTER_KEY,
  `${APPOINTMENT_FEE_FILTER_KEY}[gte]`,
  `${APPOINTMENT_FEE_FILTER_KEY}[lte]`,
]);

const CONSULTATION_FILTER_DEFINITIONS = [
  serverManagedFilter.single("gender"),
  serverManagedFilter.multi(SPECIALTIES_FILTER_KEY),
  serverManagedFilter.range(APPOINTMENT_FEE_FILTER_KEY),
];

const getSanitizedConsultationQueryString = (queryString: string) => {
  const currentParams = new URLSearchParams(queryString);
  const sanitizedParams = new URLSearchParams();

  currentParams.forEach((value, key) => {
    if (!CONSULTATION_ALLOWED_QUERY_KEYS.has(key)) return;
    const normalizedValue = value.trim();
    if (!normalizedValue) return;

    if (key === SPECIALTIES_FILTER_KEY) {
      sanitizedParams.append(key, normalizedValue);
      return;
    }

    sanitizedParams.set(key, normalizedValue);
  });

  return sanitizedParams.toString();
};

interface DoctorsListProps {
  initialQueryString: string;
  isAuthenticated: boolean;
  viewerRole?: string | null;
}

const DoctorsList = ({
  initialQueryString,
  isAuthenticated,
  viewerRole,
}: DoctorsListProps) => {
  const searchParams = useSearchParams();

  const {
    queryStringFromUrl,
    optimisticSortingState,
    optimisticPaginationState,
    isRouteRefreshPending,
    updateParams,
    handleSortingChange,
    handlePaginationChange,
  } = useServerManagedDataTable({
    searchParams,
    defaultPage: DEFAULT_PAGE,
    defaultLimit: DEFAULT_LIMIT,
  });

  const queryString = useMemo(() => {
    return getSanitizedConsultationQueryString(
      queryStringFromUrl || initialQueryString,
    );
  }, [initialQueryString, queryStringFromUrl]);

  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({
      searchParams,
      updateParams,
    });

  const { filterValues, handleFilterChange, clearAllFilters } =
    useServerManagedDataTableFilters({
      searchParams,
      definitions: CONSULTATION_FILTER_DEFINITIONS,
      updateParams,
    });

  const {
    data: doctorsResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["doctors", queryString],
    queryFn: () => getDoctors(queryString),
  });

  const { data: specialtiesResponse } = useQuery({
    queryKey: ["specialties"],
    queryFn: getAllSpecialties,
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const doctors = doctorsResponse?.data ?? [];
  const meta = doctorsResponse?.meta;
  const specialties = useMemo(
    () => specialtiesResponse?.data ?? [],
    [specialtiesResponse?.data],
  );

  const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
    return [
      {
        id: "gender",
        label: "Gender",
        type: "single-select",
        options: [
          { label: "Male", value: "MALE" },
          { label: "Female", value: "FEMALE" },
          { label: "Other", value: "OTHER" },
        ],
      },
      {
        id: SPECIALTIES_FILTER_KEY,
        label: "Specialties",
        type: "multi-select",
        options: specialties.map((specialty: ISpecialty) => ({
          label: specialty.title,
          value: specialty.title,
        })),
      },
      {
        id: APPOINTMENT_FEE_FILTER_KEY,
        label: "Fee Range",
        type: "range",
      },
    ];
  }, [specialties]);

  const filterValuesForControls = useMemo<DataTableFilterValues>(() => {
    return {
      gender: filterValues.gender,
      [SPECIALTIES_FILTER_KEY]: filterValues[SPECIALTIES_FILTER_KEY],
      [APPOINTMENT_FEE_FILTER_KEY]: filterValues[APPOINTMENT_FEE_FILTER_KEY],
    };
  }, [filterValues]);

  const isBusy = isLoading || isFetching || isRouteRefreshPending;

  return (
    <section className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-6 shadow-xs">
        <div className="relative space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Consult With Our Specialists
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            Discover board-certified physicians, compare experience and fees, and schedule
            instant video consultations with verified follow-up care.
          </p>
        </div>
      </div>

      <DoctorsListToolbar
        searchTermFromUrl={searchTermFromUrl}
        filterConfigs={filterConfigs}
        filterValuesForControls={filterValuesForControls}
        optimisticSortingState={optimisticSortingState}
        isBusy={isBusy}
        onSearchChange={handleDebouncedSearchChange}
        onFilterChange={handleFilterChange}
        onClearAllFilters={clearAllFilters}
        onSortingChange={handleSortingChange}
      />

      {isBusy && <DoctorListSkeleton />}

      {!isBusy && doctors.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 p-10 text-center shadow-xs sm:p-14">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SearchX className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">
            No doctors found
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            We couldn&apos;t find any healthcare specialists matching your search or active filters. Try adjusting your search term or resetting filters to view all available doctors.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                handleDebouncedSearchChange("");
                clearAllFilters();
              }}
            >
              Reset Filters &amp; Search
            </Button>
          </div>
        </div>
      )}

      {!isBusy && doctors.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor: IDoctor) => (
              <DoctorConsultationCard
                key={String(doctor.id)}
                doctor={doctor}
                isAuthenticated={isAuthenticated}
                viewerRole={viewerRole}
              />
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <ConsultationPagination
              currentPage={optimisticPaginationState.pageIndex + 1}
              totalPages={meta?.totalPages ?? 1}
              isLoading={isBusy}
              onPageChange={(page) => {
                handlePaginationChange({
                  pageIndex: page - 1,
                  pageSize: optimisticPaginationState.pageSize,
                });
              }}
            />

            <p className="text-center text-sm text-muted-foreground">
              Total {meta?.total ?? doctors.length} doctors
            </p>
          </div>
        </>
      )}
    </section>
  );
};

export default DoctorsList;