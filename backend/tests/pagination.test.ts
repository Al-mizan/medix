import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role } from "../src/generated/prisma/enums";
import { QueryBuilder } from "../src/app/utils/QueryBuilder";

// Mock prisma delegates
const mockPrisma = vi.hoisted(() => ({
    patient: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
    },
    doctor: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
    },
    user: {
        findUnique: vi.fn(),
    },
    appointment: {
        findMany: vi.fn(),
        count: vi.fn(),
    },
    prescription: {
        findMany: vi.fn(),
        count: vi.fn(),
    },
    review: {
        findMany: vi.fn(),
        count: vi.fn(),
    },
}));

vi.mock("../src/app/lib/prisma", () => ({
    prisma: mockPrisma,
}));

import { AppointmentService } from "../src/app/module/appointment/appointment.service";
import { PrescriptionService } from "../src/app/module/prescription/prescription.service";
import { ReviewService } from "../src/app/module/review/review.service";

describe("TICK-025: Universal Pagination Standardization Across Backend", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("QueryBuilder Pagination Standardization", () => {
        it("returns standard pagination metadata with totalPage and totalPages", async () => {
            const mockModel = {
                findMany: vi.fn().mockResolvedValue([
                    { id: "1", name: "Doc 1" },
                    { id: "2", name: "Doc 2" },
                ]),
                count: vi.fn().mockResolvedValue(22),
            };

            const qb = new QueryBuilder(mockModel as any, { page: 2, limit: 5 });
            qb.paginate();

            const result = await qb.execute();

            expect(mockModel.count).toHaveBeenCalled();
            expect(mockModel.findMany).toHaveBeenCalled();
            expect(result.data).toHaveLength(2);
            expect(result.meta).toEqual({
                page: 2,
                limit: 5,
                total: 22,
                totalPages: 5,
                totalPage: 5,
            });
        });

        it("correctly calculates skip offset for page=2&limit=5", () => {
            const mockModel = {
                findMany: vi.fn().mockResolvedValue([]),
                count: vi.fn().mockResolvedValue(0),
            };

            const qb = new QueryBuilder(mockModel as any, { page: 2, limit: 5 });
            qb.paginate();

            const builtQuery = qb.getQuery();
            expect(builtQuery.skip).toBe(5);
            expect(builtQuery.take).toBe(5);
        });

        it("clamps unbounded limit queries to safe maximum 100", () => {
            const mockModel = {
                findMany: vi.fn().mockResolvedValue([]),
                count: vi.fn().mockResolvedValue(0),
            };

            const qb = new QueryBuilder(mockModel as any, { page: 1, limit: 50000 });
            qb.paginate();

            const builtQuery = qb.getQuery();
            expect(builtQuery.take).toBe(100);
        });
    });

    describe("AppointmentService.getMyAppointments Pagination", () => {
        it("paginates appointments for a patient and returns data and meta", async () => {
            mockPrisma.patient.findUnique.mockResolvedValue({ id: "pat-1", email: "pat@medix.com" });
            mockPrisma.doctor.findUnique.mockResolvedValue(null);
            mockPrisma.appointment.count.mockResolvedValue(15);
            mockPrisma.appointment.findMany.mockResolvedValue([
                { id: "appt-1", status: "SCHEDULED" },
                { id: "appt-2", status: "SCHEDULED" },
                { id: "appt-3", status: "SCHEDULED" },
                { id: "appt-4", status: "SCHEDULED" },
                { id: "appt-5", status: "SCHEDULED" },
            ]);

            const user = { userId: "usr-1", email: "pat@medix.com", role: Role.PATIENT };
            const result = await AppointmentService.getMyAppointments(user, { page: 2, limit: 5 });

            expect(mockPrisma.appointment.findMany).toHaveBeenCalled();
            expect(mockPrisma.appointment.count).toHaveBeenCalled();
            expect(result.data).toHaveLength(5);
            expect(result.meta).toEqual({
                page: 2,
                limit: 5,
                total: 15,
                totalPages: 3,
                totalPage: 3,
            });
        });
    });

    describe("PrescriptionService.myPrescriptions Pagination", () => {
        it("paginates prescriptions for a doctor and returns data and meta", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: "usr-doc", email: "doc@medix.com", role: Role.DOCTOR });
            mockPrisma.prescription.count.mockResolvedValue(8);
            mockPrisma.prescription.findMany.mockResolvedValue([
                { id: "rx-1", instructions: "Rest" },
                { id: "rx-2", instructions: "Drink water" },
            ]);

            const user = { userId: "usr-doc", email: "doc@medix.com", role: Role.DOCTOR };
            const result = await PrescriptionService.myPrescriptions(user, { page: 1, limit: 2 });

            expect(mockPrisma.prescription.findMany).toHaveBeenCalled();
            expect(mockPrisma.prescription.count).toHaveBeenCalled();
            expect(result.data).toHaveLength(2);
            expect(result.meta).toEqual({
                page: 1,
                limit: 2,
                total: 8,
                totalPages: 4,
                totalPage: 4,
            });
        });
    });

    describe("ReviewService.myReviews Pagination", () => {
        it("paginates reviews for a patient and returns data and meta", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: "usr-pat", email: "pat@medix.com", role: Role.PATIENT });
            mockPrisma.patient.findUniqueOrThrow.mockResolvedValue({ id: "pat-1", email: "pat@medix.com" });
            mockPrisma.review.count.mockResolvedValue(12);
            mockPrisma.review.findMany.mockResolvedValue([
                { id: "rev-1", rating: 5 },
                { id: "rev-2", rating: 4 },
                { id: "rev-3", rating: 5 },
            ]);

            const user = { userId: "usr-pat", email: "pat@medix.com", role: Role.PATIENT };
            const result = await ReviewService.myReviews(user, { page: 1, limit: 3 });

            expect(mockPrisma.review.findMany).toHaveBeenCalled();
            expect(mockPrisma.review.count).toHaveBeenCalled();
            expect(result.data).toHaveLength(3);
            expect(result.meta).toEqual({
                page: 1,
                limit: 3,
                total: 12,
                totalPages: 4,
                totalPage: 4,
            });
        });
    });
});
