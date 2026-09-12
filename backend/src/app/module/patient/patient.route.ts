import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PatientController } from "./patient.controller";
import { updateMyPatientProfileMiddleware } from "./patient.middlewares";
import { PatientValidation } from "./patient.validation";

const router = Router();

router.get("/my-profile",
    checkAuth(Role.PATIENT),
    PatientController.getMyProfile
);

router.patch("/update-my-profile",
    checkAuth(Role.PATIENT),
    multerUpload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "medicalReports", maxCount: 5 }
    ]),
    updateMyPatientProfileMiddleware,
    validateRequest(PatientValidation.updatePatientProfileZodSchema),
    PatientController.updateMyProfile
);

router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PatientController.getAllPatients
);

router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PatientController.getPatientById
);

router.delete("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PatientController.deletePatient
);

export const PatientRoutes = router;