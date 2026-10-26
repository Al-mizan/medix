import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DoctorsList from "../DoctorsList";
import * as doctorServices from "@/services/doctor.services";
import { IDoctor } from "@/types/doctor.types";

// Mock next/navigation
const mockSearchParams = new URLSearchParams("searchTerm=cardio");
const mockPushState = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => mockSearchParams),
  useRouter: vi.fn(() => ({
    refresh: mockRouterRefresh,
    replace: vi.fn(),
    push: vi.fn(),
  })),
  usePathname: vi.fn(() => "/consultation"),
}));

// Mock doctor services
vi.mock("@/services/doctor.services", () => ({
  getDoctors: vi.fn(),
  getAllSpecialties: vi.fn(),
}));

describe("DoctorsList Component & Empty State Polish", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    window.history.pushState = mockPushState;
  });

  it("renders polished empty state with reset button when no doctors match", async () => {
    vi.mocked(doctorServices.getDoctors).mockResolvedValue({
      success: true,
      message: "Doctors fetched successfully",
      data: [],
      meta: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        totalPage: 0,
      },
    });

    vi.mocked(doctorServices.getAllSpecialties).mockResolvedValue({
      success: true,
      message: "Specialties fetched",
      data: [],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DoctorsList
          initialQueryString="searchTerm=nonexistent"
          isAuthenticated={false}
        />
      </QueryClientProvider>
    );

    expect(await screen.findByText("No doctors found")).toBeInTheDocument();
    expect(
      screen.getByText(/We couldn't find any healthcare specialists matching your search/i)
    ).toBeInTheDocument();

    const resetBtn = screen.getByRole("button", { name: "Reset Filters & Search" });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(mockPushState).toHaveBeenCalled();
  });

  it("renders doctor cards and pagination when doctors match query", async () => {
    vi.mocked(doctorServices.getDoctors).mockResolvedValue({
      success: true,
      message: "Doctors fetched successfully",
      data: [
        {
          id: "doc-1",
          name: "Dr. Gregory House",
          email: "house@medix.com",
          designation: "Head of Diagnostic Medicine",
          qualification: "MD",
          currentWorkingPlace: "Princeton-Plainsboro",
          appointmentFee: 200,
          averageRating: 4.9,
          experience: 15,
          gender: "MALE",
          isDeleted: false,
          user: {
            id: "user-1",
            email: "house@medix.com",
            name: "Dr. Gregory House",
            role: "DOCTOR",
            status: "ACTIVE",
          },
          specialties: [],
        },
      ] as unknown as IDoctor[],
      meta: {
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
        totalPage: 1,
      },
    });

    vi.mocked(doctorServices.getAllSpecialties).mockResolvedValue({
      success: true,
      message: "Specialties fetched",
      data: [],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DoctorsList
          initialQueryString="searchTerm=house"
          isAuthenticated={true}
        />
      </QueryClientProvider>
    );

    expect(await screen.findByText("Dr. Gregory House")).toBeInTheDocument();
    expect(screen.getByText("Total 1 doctors")).toBeInTheDocument();
  });
});

