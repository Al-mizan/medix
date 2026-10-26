import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationType, Role } from "../../src/generated/prisma/enums";
import { NotificationService } from "../../src/app/module/notification/notification.service";
import { prisma } from "../../src/app/lib/prisma";

vi.mock("../../src/app/lib/prisma", () => ({
    prisma: {
        notification: {
            create: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

describe("NotificationService", () => {
    const mockUser = {
        userId: "user-123",
        role: Role.PATIENT,
        email: "patient@medix.com",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should create a notification successfully", async () => {
        const payload = {
            userId: "user-123",
            title: "Appointment Scheduled",
            message: "Your consultation has been booked.",
            type: NotificationType.APPOINTMENT,
            actionUrl: "/dashboard/my-appointments",
        };

        const mockCreated = {
            id: "notif-1",
            ...payload,
            read: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        vi.mocked(prisma.notification.create).mockResolvedValue(mockCreated as any);

        const result = await NotificationService.createNotification(payload);
        expect(result.id).toBe("notif-1");
        expect(result.title).toBe(payload.title);
        expect(prisma.notification.create).toHaveBeenCalledWith({
            data: {
                userId: payload.userId,
                title: payload.title,
                message: payload.message,
                type: payload.type,
                actionUrl: payload.actionUrl,
            },
        });
    });

    it("should fetch my notifications with unread count and pagination meta", async () => {
        const mockList = [
            {
                id: "notif-1",
                userId: "user-123",
                title: "Alert 1",
                message: "Message 1",
                type: NotificationType.APPOINTMENT,
                read: false,
                actionUrl: "/link",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        vi.mocked(prisma.notification.findMany).mockResolvedValue(mockList as any);
        vi.mocked(prisma.notification.count)
            .mockResolvedValueOnce(1) // total
            .mockResolvedValueOnce(1); // unreadCount

        const result = await NotificationService.getMyNotifications(mockUser, { page: 1, limit: 10 });
        expect(result.data).toHaveLength(1);
        expect(result.meta.unreadCount).toBe(1);
        expect(result.meta.total).toBe(1);
    });

    it("should mark a single notification as read", async () => {
        const existing = {
            id: "notif-1",
            userId: "user-123",
            read: false,
        };

        vi.mocked(prisma.notification.findFirst).mockResolvedValue(existing as any);
        vi.mocked(prisma.notification.update).mockResolvedValue({
            ...existing,
            read: true,
        } as any);

        const result = await NotificationService.markAsRead(mockUser, "notif-1");
        expect(result.read).toBe(true);
        expect(prisma.notification.update).toHaveBeenCalledWith({
            where: { id: "notif-1" },
            data: { read: true },
        });
    });

    it("should mark all notifications as read", async () => {
        vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 } as any);

        const result = await NotificationService.markAllAsRead(mockUser);
        expect(result.count).toBe(5);
        expect(prisma.notification.updateMany).toHaveBeenCalledWith({
            where: {
                userId: "user-123",
                read: false,
            },
            data: {
                read: true,
            },
        });
    });
});
