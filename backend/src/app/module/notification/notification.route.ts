import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    NotificationController.getMyNotifications
);

router.patch(
    "/mark-all-read",
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    NotificationController.markAllAsRead
);

router.patch(
    "/:id/read",
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    NotificationController.markAsRead
);

router.delete(
    "/:id",
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    NotificationController.deleteNotification
);

export const NotificationRoutes = router;
