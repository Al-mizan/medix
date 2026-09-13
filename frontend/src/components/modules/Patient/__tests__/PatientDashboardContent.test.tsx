import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PatientDashboardContent from "../Dashboard/PatientDashboardContent";
import * as dashboardServices from "@/services/dashboard.services";
import * as appointmentServices from "@/services/appointment.services";
import * as prescriptionServices from "@/services/prescription.services";
import * as patientServices from "@/services/patient.services";
import type { AppointmentStatus, PaymentStatus } from "@/types/appointment.types";

vi.mock("@/services/dashboard.services", () => ({
    getDashboardData: vi.fn(),
}));

vi.mock("@/services/appointment.services", () => ({
    getMyAppointments: vi.fn(),
}));

vi.mock("@/services/prescription.services", () => ({
    getMyPrescriptions: vi.fn(),
}));

vi.mock("@/services/patient.services", () => ({
    getMyPatientProfile: vi.fn(),
}));

vi.mock("@/app/_actions/appointment.actions", () => ({
    initiateAppointmentPaymentAction: vi.fn(),
}));

vi.mock("recharts", async () => {
    const original = await vi.importActual<Record<string, unknown>>("recharts");
    return {
        ...original,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="responsive-container">{children}</div>
        ),
    };
});

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

describe("PatientDashboardContent", () => {
    let queryClient: QueryClient;

    const mockProfile = {
        id: "pat-1",
        userId: "usr-1",
        name: "Jane Patient",
        email: "jane@example.com",
        isDeleted: false,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
        user: {
            id: "usr-1",
            email: "jane@example.com",
            role: "PATIENT",
            status: "ACTIVE",
        },
        patientHealthData: {
            bloodGroup: "O_POSITIVE",
            gender: "FEMALE",
            height: "165",
            weight: "60",
            hasAllergies: false,
            hasDiabetes: false,
            smokingStatus: false,
            pregnancyStatus: false,
            hasPastSurgeries: false,
            recentAnxiety: false,
            recentDepression: false,
            dateOfBirth: "1995-05-15",
        },
    };

    const mockAppointments = [
        {
            id: "appt-1",
            doctorId: "doc-1",
            patientId: "pat-1",
            status: "SCHEDULED" as AppointmentStatus,
            paymentStatus: "PAID" as PaymentStatus,
            createdAt: "2026-10-01T00:00:00Z",
            doctor: { name: "Dr. Sarah Jenkins", designation: "Cardiologist" },
            schedule: {
                startDateTime: "2026-10-15T09:00:00Z",
                endDateTime: "2026-10-15T09:30:00Z",
            },
        },
        {
            id: "appt-2",
            doctorId: "doc-2",
            patientId: "pat-1",
            status: "COMPLETED" as AppointmentStatus,
            paymentStatus: "PAID" as PaymentStatus,
            createdAt: "2026-09-01T00:00:00Z",
            doctor: { name: "Dr. Gregory House", designation: "Diagnostician" },
            schedule: {
                startDateTime: "2026-09-10T10:00:00Z",
                endDateTime: "2026-09-10T10:30:00Z",
            },
        },
        {
            id: "appt-3",
            doctorId: "doc-3",
            patientId: "pat-1",
            status: "COMPLETED" as AppointmentStatus,
            paymentStatus: "PAID" as PaymentStatus,
            createdAt: "2026-08-01T00:00:00Z",
            doctor: { name: "Dr. James Wilson", designation: "Oncologist" },
            schedule: {
                startDateTime: "2026-08-10T11:00:00Z",
                endDateTime: "2026-08-10T11:30:00Z",
            },
        },
    ];

    const mockPrescriptions = [
        {
            id: "rx-1",
            appointmentId: "appt-2",
            patientId: "pat-1",
            doctorId: "doc-2",
            instructions: "Take medicine twice daily",
            createdAt: "2026-09-10T11:00:00Z",
            updatedAt: "2026-09-10T11:00:00Z",
            doctor: { name: "Dr. Gregory House" },
        },
        {
            id: "rx-2",
            appointmentId: "appt-3",
            patientId: "pat-1",
            doctorId: "doc-3",
            instructions: "Rest and hydration",
            createdAt: "2026-08-10T12:00:00Z",
            updatedAt: "2026-08-10T12:00:00Z",
            doctor: { name: "Dr. James Wilson" },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = createTestQueryClient();

        vi.mocked(dashboardServices.getDashboardData).mockResolvedValue({
            success: true,
            data: {
                appointmentCount: 3,
                reviewCount: 1,
                appointmentStatusDistribution: [
                    { status: "SCHEDULED", count: 1 },
                    { status: "COMPLETED", count: 2 },
                ],
            },
        } as unknown as Awaited<ReturnType<typeof dashboardServices.getDashboardData>>);

        vi.mocked(appointmentServices.getMyAppointments).mockResolvedValue({
            success: true,
            data: mockAppointments,
        } as unknown as Awaited<ReturnType<typeof appointmentServices.getMyAppointments>>);

        vi.mocked(prescriptionServices.getMyPrescriptions).mockResolvedValue({
            success: true,
            data: mockPrescriptions,
        } as unknown as Awaited<ReturnType<typeof prescriptionServices.getMyPrescriptions>>);

        vi.mocked(patientServices.getMyPatientProfile).mockResolvedValue({
            success: true,
            data: mockProfile,
        } as unknown as Awaited<ReturnType<typeof patientServices.getMyPatientProfile>>);
    });

    it("renders patient overview welcome header with patient name", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PatientDashboardContent />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByRole("heading", { level: 1, name: /welcome back, jane patient/i })).toBeInTheDocument();
        });
    });

    it("renders all 4 stats cards with correct values calculated from mock data", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PatientDashboardContent />
            </QueryClientProvider>
        );

        await waitFor(() => {
            // Stats card titles
            expect(screen.getByText("Total Appointments")).toBeInTheDocument();
            expect(screen.getByText("Upcoming Appointments")).toBeInTheDocument();
            expect(screen.getByText("Completed Visits")).toBeInTheDocument();
            expect(screen.getByText("Prescriptions")).toBeInTheDocument();

            // Computed values
            // Total appointments: 3
            expect(screen.getByText("3")).toBeInTheDocument();
            // Upcoming appointments: 1
            expect(screen.getByText("1")).toBeInTheDocument();
            // Completed visits: 2
            // Prescriptions: 2
            const twos = screen.getAllByText("2");
            expect(twos.length).toBeGreaterThanOrEqual(2);
        });
    });

    it("renders action buttons for booking appointment and updating records", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <PatientDashboardContent />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByRole("link", { name: /book appointment/i })).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /update health records/i })).toBeInTheDocument();
        });
    });
});
