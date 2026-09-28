import multer from "multer";
import path from "path";
import status from "http-status";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import AppError from "../errorHelpers/AppError";

export const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

export const ALLOWED_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf",
];

export const BLOCKED_EXTENSIONS = [
    ".exe",
    ".sh",
    ".bat",
    ".js",
    ".mjs",
    ".cjs",
    ".cmd",
    ".msi",
    ".bin",
    ".com",
    ".vbs",
];

export const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (BLOCKED_EXTENSIONS.includes(extension)) {
        return cb(
            new AppError(
                status.BAD_REQUEST,
                `Executable and script extensions (${extension}) are strictly prohibited.`
            )
        );
    }

    if (
        !ALLOWED_EXTENSIONS.includes(extension) ||
        !ALLOWED_MIME_TYPES.includes(file.mimetype)
    ) {
        return cb(
            new AppError(
                status.BAD_REQUEST,
                "Invalid file type. Only JPEG, PNG, WEBP images and PDF documents are allowed."
            )
        );
    }

    cb(null, true);
};

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: async (req, file) => {
        const originalName = file.originalname;
        const extension = originalName.split(".").pop()?.toLocaleLowerCase();

        const fileNameWithoutExtension = originalName
            .split(".")
            .slice(0, -1)
            .join(".")
            .toLowerCase()
            .replace(/\s+/g, "-")
            // eslint-disable-next-line no-useless-escape
            .replace(/[^a-z0-9\-]/g, "");

        const uniqueName =
            Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            fileNameWithoutExtension;

        const folder = extension === "pdf" ? "pdfs" : "images";

        return {
            folder: `ph-healthcare/${folder}`,
            public_id: uniqueName,
            resource_type: "auto",
        };
    },
});

export const multerUpload = multer({
    storage,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25 MB max limit
    },
    fileFilter,
});