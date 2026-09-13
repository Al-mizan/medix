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
import DoctorConsultationCard from "./DoctorConsultationCard";
import ConsultationPagination from "./ConsultationPagination";
import DoctorsListToolbar from "./DoctorsListToolbar";

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
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-cyan-50 via-white to-blue-50 p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="relative space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Consult With Our Specialists
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Discover trusted doctors, compare experience and fees, and open
            detailed profiles to find the right specialist.
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

      {isBusy && (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          Loading doctors...
        </div>
      )}

      {!isBusy && doctors.length === 0 && (
        <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          No doctors found for your current search/filter.
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