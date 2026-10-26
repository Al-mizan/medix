import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BookAppointmentModal from "../BookAppointmentModal";
import * as doctorServices from "@/services/doctor.services";
import { IDoctorDetails } from "@/types/doctor.types";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock("@/services/doctor.services", () => ({
  getDoctorById: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe("BookAppointmentModal Inline Validation & Skeletons", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it("opens modal and displays inline validation error if proceeding without selecting a slot", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    vi.mocked(doctorServices.getDoctorById).mockResolvedValue({
      success: true,
      message: "Doctor fetched",
      data: {
        id: "doc-123",
        name: "Dr. Gregory House",
        doctorSchedules: [
          {
            id: "sched-item-1",
            isBooked: false,
            schedule: {
              id: "sched-1",
              startDateTime: futureDate.toISOString(),
              endDateTime: futureDate.toISOString(),
            },
          },
        ],
      } as unknown as IDoctorDetails,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BookAppointmentModal
          doctorId="doc-123"
          doctorName="Dr. Gregory House"
          isAuthenticated={true}
          viewerRole="PATIENT"
        />
      </QueryClientProvider>
    );

    const triggerBtn = screen.getByRole("button", { name: /book appointment/i });
    fireEvent.click(triggerBtn);

    expect(await screen.findByRole("heading", { name: "Book Appointment" })).toBeInTheDocument();

    const proceedBtn = screen.getByRole("button", { name: /proceed to confirm/i });
    fireEvent.click(proceedBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/please select an available appointment slot before proceeding/i)
      ).toBeInTheDocument();
    });
  });

  it("clears inline validation error once a schedule slot is selected", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    vi.mocked(doctorServices.getDoctorById).mockResolvedValue({
      success: true,
      message: "Doctor fetched",
      data: {
        id: "doc-123",
        name: "Dr. Gregory House",
        doctorSchedules: [
          {
            id: "sched-item-1",
            isBooked: false,
            schedule: {
              id: "sched-1",
              startDateTime: futureDate.toISOString(),
              endDateTime: futureDate.toISOString(),
            },
          },
        ],
      } as unknown as IDoctorDetails,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BookAppointmentModal
          doctorId="doc-123"
          doctorName="Dr. Gregory House"
          isAuthenticated={true}
          viewerRole="PATIENT"
        />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /book appointment/i }));

    const proceedBtn = await screen.findByRole("button", { name: /proceed to confirm/i });
    fireEvent.click(proceedBtn);

    expect(
      await screen.findByText(/please select an available appointment slot before proceeding/i)
    ).toBeInTheDocument();

    const slotBtn = screen.getByRole("button", { name: /tap to select/i });
    fireEvent.click(slotBtn);

    await waitFor(() => {
      expect(
        screen.queryByText(/please select an available appointment slot before proceeding/i)
      ).not.toBeInTheDocument();
    });
  });
});
