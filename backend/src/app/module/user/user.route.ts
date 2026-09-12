import { Router } from "express";
import { createDoctorZodSchema, createAdminZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";


const router = Router();


router.post("/create-doctor", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createDoctorZodSchema), 
    UserController.createDoctor);

router.post("/create-admin",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(createAdminZodSchema),
    UserController.createAdmin);

export const UserRoutes: Router = router;