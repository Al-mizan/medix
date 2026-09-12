import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IqueryParams } from "../../interface/query.interface";


const createSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        // console.log("req.file", req.file);
        const fileUrl =
            req.file?.path ||
            // multer-storage-cloudinary can attach url fields depending on version
            (req.file as unknown as { secure_url?: string; url?: string } | undefined)?.secure_url ||
            (req.file as unknown as { secure_url?: string; url?: string } | undefined)?.url;

        if (!fileUrl) {
            throw new AppError(
                status.BAD_REQUEST,
                'Specialty icon file is required. Send multipart/form-data with field "file" (File) and field "data" (Text JSON).'
            );
        }
        const payload = {
            ...req.body,
            icon: fileUrl,
        };
        const result = await SpecialtyService.createSpecialty(payload);

        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: 'Specialty created successfully',
            data: result
        });
    }
)

const getAllSpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const query = req.query;
        const result = await SpecialtyService.getAllSpecialties(query as IqueryParams);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Specialties fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    }
);

const deleteSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new AppError(status.BAD_REQUEST, "Specialty ID is required");
        }
        await SpecialtyService.deleteSpecialty(id as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Specialty deleted successfully",
        });
    }
);

const updateSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;
        if (!id) {
            throw new AppError(status.BAD_REQUEST, "Specialty ID is required");
        }
        const specialty = await SpecialtyService.updateSpecialty(id as string, payload);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Specialty updated successfully",
            data: specialty,
        });
    }
);

export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty,
}