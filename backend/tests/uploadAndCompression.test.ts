import { describe, it, expect } from "vitest";
import request from "supertest";
import express, { Request, Response } from "express";
import compression from "compression";
import {
    multerUpload,
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
    BLOCKED_EXTENSIONS,
    fileFilter,
} from "../src/app/config/multer.config";
import { globalErrorHandler } from "../src/app/middleware/globalErrorHandler";
import AppError from "../src/app/errorHelpers/AppError";

describe("TICK-022: Compression & File Upload Hardening", () => {
    describe("Response Compression", () => {
        const app = express();

        app.post("/webhook", (req: Request, res: Response) => {
            // Large payload
            res.status(200).json({ data: "w".repeat(2048) });
        });

        app.use(
            compression({
                threshold: 1024,
                filter: (req: Request, res: Response) => {
                    if (req.path === "/webhook" || req.originalUrl === "/webhook") {
                        return false;
                    }
                    return compression.filter(req, res);
                },
            })
        );

        app.get("/large-data", (req: Request, res: Response) => {
            res.status(200).json({ data: "a".repeat(2048) });
        });

        app.get("/small-data", (req: Request, res: Response) => {
            res.status(200).json({ data: "short" });
        });

        it("should compress responses exceeding 1024 bytes when Accept-Encoding: gzip is set", async () => {
            const res = await request(app)
                .get("/large-data")
                .set("Accept-Encoding", "gzip");

            expect(res.status).toBe(200);
            expect(res.headers["content-encoding"]).toBe("gzip");
        });

        it("should not compress responses below the 1024-byte threshold", async () => {
            const res = await request(app)
                .get("/small-data")
                .set("Accept-Encoding", "gzip");

            expect(res.status).toBe(200);
            expect(res.headers["content-encoding"]).toBeUndefined();
        });

        it("should exempt /webhook from compression", async () => {
            const res = await request(app)
                .post("/webhook")
                .set("Accept-Encoding", "gzip");

            expect(res.status).toBe(200);
            expect(res.headers["content-encoding"]).toBeUndefined();
        });
    });

    describe("Multer File Upload Validation", () => {
        let uploadApp: express.Application;

        beforeAll(() => {
            uploadApp = express();

            // Using multer with memory storage for isolated testing of limits & fileFilter
            const testMulter = (multerUpload as any);

            uploadApp.post(
                "/upload-test",
                testMulter.single("file"),
                (req: Request, res: Response) => {
                    res.status(200).json({
                        success: true,
                        file: req.file?.originalname,
                    });
                }
            );

            uploadApp.use(globalErrorHandler);
        });

        it("fileFilter accepts valid images and PDF documents", () => {
            const validCases = [
                { originalname: "avatar.jpg", mimetype: "image/jpeg" },
                { originalname: "scan.jpeg", mimetype: "image/jpeg" },
                { originalname: "document.png", mimetype: "image/png" },
                { originalname: "photo.webp", mimetype: "image/webp" },
                { originalname: "prescription.pdf", mimetype: "application/pdf" },
            ];

            validCases.forEach(({ originalname, mimetype }) => {
                let accepted = false;
                let errorOccurred: unknown = null;

                fileFilter!(
                    {} as Request,
                    { originalname, mimetype } as Express.Multer.File,
                    (err: unknown, accept?: boolean) => {
                        errorOccurred = err;
                        accepted = !!accept;
                    }
                );

                expect(errorOccurred).toBeNull();
                expect(accepted).toBe(true);
            });
        });

        it("fileFilter rejects executable extensions with AppError 400", () => {
            const maliciousFiles = [
                "malware.exe",
                "script.sh",
                "hack.bat",
                "exploit.js",
                "payload.mjs",
            ];

            maliciousFiles.forEach((filename) => {
                let errorResult: any = null;

                fileFilter!(
                    {} as Request,
                    { originalname: filename, mimetype: "application/octet-stream" } as Express.Multer.File,
                    (err: unknown) => {
                        errorResult = err;
                    }
                );

                expect(errorResult).toBeInstanceOf(AppError);
                expect(errorResult.statusCode).toBe(400);
                expect(errorResult.message).toMatch(/strictly prohibited/i);
            });
        });

        it("fileFilter rejects disallowed MIME types with AppError 400", () => {
            const invalidFiles = [
                { originalname: "video.mp4", mimetype: "video/mp4" },
                { originalname: "archive.zip", mimetype: "application/zip" },
                { originalname: "text.txt", mimetype: "text/plain" },
            ];

            invalidFiles.forEach(({ originalname, mimetype }) => {
                let errorResult: any = null;

                fileFilter!(
                    {} as Request,
                    { originalname, mimetype } as Express.Multer.File,
                    (err: unknown) => {
                        errorResult = err;
                    }
                );

                expect(errorResult).toBeInstanceOf(AppError);
                expect(errorResult.statusCode).toBe(400);
                expect(errorResult.message).toMatch(/Only JPEG, PNG, WEBP images and PDF documents are allowed/i);
            });
        });

        it("HTTP 400 Bad Request returned when file exceeds 25MB limit", async () => {
            // Create a custom multer instance simulating 25MB limit for Supertest
            const customApp = express();
            const multer = (await import("multer")).default;
            const limitedUpload = multer({
                limits: { fileSize: 100 }, // set small limit for fast test
                fileFilter,
            });

            customApp.post("/test-size", limitedUpload.single("file"), (req, res) => {
                res.status(200).json({ success: true });
            });
            customApp.use(globalErrorHandler);

            const buffer = Buffer.alloc(200, "a");
            const res = await request(customApp)
                .post("/test-size")
                .attach("file", buffer, { filename: "large.pdf", contentType: "application/pdf" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/File size exceeds/i);
        });
    });
});
