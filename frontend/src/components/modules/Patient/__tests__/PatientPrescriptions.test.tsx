import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PatientPrescriptionCard from "../Prescriptions/PatientPrescriptionCard";
import PatientPrescriptionDetailsDialog from "../Prescriptions/PatientPrescriptionDetailsDialog";
import PatientPrescriptionsList from "../Prescriptions/PatientPrescriptionsList";
import { IPrescription } from "@/types/prescription.types";
import * as prescriptionServices from "@/services/prescription.services";

// Mock prescription services
vi.mock("@/services/prescription.services", () => ({
    getMyPrescriptions: vi.fn(),
}));

const mockPrescription1: IPrescription = {
    id: "rx-1",
    appointmentId: "appt-1",
    patientId: "pat-1",
    doctorId: "doc-1",
    createdAt: "2026-08-15T10:00:00Z",
    updatedAt: "2026-08-15T10:00:00Z",
    followUpDate: "2026-08-30T10:00:00Z",
    instructions:
        "MEDICATIONS:\n1. Amoxicillin | 500mg | 3 times daily | 7 days\n2. Paracetamol | 500mg | Twice daily | 3 days\n3. Vitamin C | 1000mg | Once daily | 10 days\n4. Cetirizine | 10mg | At bedtime | 5 days\n\nADDITIONAL INSTRUCTIONS:\nTake after meals with plenty of water.",
    pdfUrl: "https://res.cloudinary.com/demo/image/upload/sample.pdf",
    doctor: {
        id: "doc-1",
        name: "Dr. Sarah Jenkins",
        email: "sarah@medix.com",
        profilePhoto: "https://example.com/sarah.jpg",
        contactNumber: "123456789",
        address: "Hospital Suite 4",
        designation: "Cardiologist",
    },
    appointment: {
        id: "appt-1",
        status: "COMPLETED",
        paymentStatus: "PAID",
        schedule: {
            startDateTime: "2026-08-15T09:30:00Z",
            endDateTime: "2026-08-15T10:00:00Z",
        },
    },
};

const mockPrescription2: IPrescription = {
    id: "rx-2",
    appointmentId: "appt-2",
    patientId: "pat-1",
    doctorId: "doc-2",
    createdAt: "2026-07-10T14:00:00Z",
    updatedAt: "2026-07-10T14:00:00Z",
    followUpDate: "",
    instructions: "Simple instructions for allergy relief.",
    pdfUrl: null,
    doctor: {
        id: "doc-2",
        name: "Dr. Gregory House",
        email: "house@medix.com",
        profilePhoto: null,
        contactNumber: "987654321",
        address: "Diagnostic Dept",
        designation: "Diagnostician",
    },
    appointment: null,
};

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

describe("PatientPrescriptionCard", () => {
    it("renders doctor name, designation, and dates correctly", () => {
        render(<PatientPrescriptionCard prescription={mockPrescription1} />);

        expect(screen.getByText("Dr. Sarah Jenkins")).toBeInTheDocument();
        expect(screen.getByText("Cardiologist")).toBeInTheDocument();
        expect(screen.getByText(/Next:/)).toBeInTheDocument();
        expect(screen.getByText("Consultation:")).toBeInTheDocument();
        expect(screen.getByText("Prescribed:")).toBeInTheDocument();
    });

    it("displays medication chips and handles overflow count", () => {
        render(<PatientPrescriptionCard prescription={mockPrescription1} />);

        expect(screen.getByText("Amoxicillin")).toBeInTheDocument();
        expect(screen.getByText("Paracetamol")).toBeInTheDocument();
        expect(screen.getByText("Vitamin C")).toBeInTheDocument();
        // Since there are 4 medications and only first 3 are displayed, '+1 more' should be shown
        expect(screen.getByText("+1 more")).toBeInTheDocument();
    });

    it("renders download PDF button when pdfUrl is provided", () => {
        render(<PatientPrescriptionCard prescription={mockPrescription1} />);

        const downloadLink = screen.getByRole("link", { name: /download pdf/i });
        expect(downloadLink).toBeInTheDocument();
        expect(downloadLink).toHaveAttribute(
            "href",
            "https://res.cloudinary.com/demo/image/upload/sample.pdf"
        );
        expect(downloadLink).toHaveAttribute("target", "_blank");
    });

    it("renders disabled state when no pdfUrl exists", () => {
        render(<PatientPrescriptionCard prescription={mockPrescription2} />);

        expect(screen.getByRole("button", { name: /no pdf available/i })).toBeDisabled();
    });

    it("renders prescription details dialog content when open", () => {
        render(
            <PatientPrescriptionDetailsDialog
                prescription={mockPrescription1}
                open={true}
                onOpenChange={vi.fn()}
            />
        );

        expect(screen.getByText("Prescription Details")).toBeInTheDocument();
        expect(
            screen.getByText(/Issued by Dr. Sarah Jenkins • Cardiologist/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Prescribed Medications \(4\)/)).toBeInTheDocument();
        expect(screen.getByText("Amoxicillin")).toBeInTheDocument();
        expect(screen.getByText("Cetirizine")).toBeInTheDocument();
        expect(
            screen.getByText("Physician Advice & Special Instructions")
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Take after meals with plenty of water./)
        ).toBeInTheDocument();
    });

    it("opens prescription details dialog when 'View Details' is clicked on the card", async () => {
        render(<PatientPrescriptionCard prescription={mockPrescription1} />);

        const viewDetailsBtn = screen.getByRole("button", { name: /view details/i });
        fireEvent.click(viewDetailsBtn);

        await waitFor(() => {
            expect(screen.getByText("Prescription Details")).toBeInTheDocument();
            expect(
                screen.getByText(/Issued by Dr. Sarah Jenkins • Cardiologist/)
            ).toBeInTheDocument();
        });
    });
});

describe("PatientPrescriptionsList", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = createTestQueryClient();
    });

    it("renders empty state when there are no prescriptions", async () => {
        vi.mocked(prescriptionServices.getMyPrescriptions).mockResolvedValue({
            success: true,
            message: "Prescriptions fetched",
            data: [],
        });

        render(
            <QueryClientProvider client={queryClient}>
                <PatientPrescriptionsList />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("No Prescriptions on File Yet")).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /find a specialist/i })).toBeInTheDocument();
        });
    });

    it("renders prescriptions list and allows filtering by doctor name", async () => {
        vi.mocked(prescriptionServices.getMyPrescriptions).mockResolvedValue({
            success: true,
            message: "Prescriptions fetched",
            data: [mockPrescription1, mockPrescription2],
        });

        render(
            <QueryClientProvider client={queryClient}>
                <PatientPrescriptionsList />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Dr. Sarah Jenkins")).toBeInTheDocument();
            expect(screen.getByText("Dr. Gregory House")).toBeInTheDocument();
        });

        // Search for 'Jenkins'
        const searchInput = screen.getByPlaceholderText(/search by doctor or medicine/i);
        fireEvent.change(searchInput, { target: { value: "Jenkins" } });

        expect(screen.getByText("Dr. Sarah Jenkins")).toBeInTheDocument();
        expect(screen.queryByText("Dr. Gregory House")).not.toBeInTheDocument();
    });

    it("toggles sorting order between Newest First and Oldest First", async () => {
        vi.mocked(prescriptionServices.getMyPrescriptions).mockResolvedValue({
            success: true,
            message: "Prescriptions fetched",
            data: [mockPrescription1, mockPrescription2],
        });

        render(
            <QueryClientProvider client={queryClient}>
                <PatientPrescriptionsList />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Dr. Sarah Jenkins")).toBeInTheDocument();
        });

        const sortButton = screen.getByRole("button", { name: /newest first/i });
        expect(sortButton).toBeInTheDocument();

        fireEvent.click(sortButton);
        expect(screen.getByRole("button", { name: /oldest first/i })).toBeInTheDocument();
    });
});
