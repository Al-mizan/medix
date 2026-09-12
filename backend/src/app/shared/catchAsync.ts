import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Higher-order utility wrapping asynchronous Express request handlers to catch unhandled Promise rejections
 * and forward them cleanly to the NextFunction error boundary.
 *
 * @param fn - The asynchronous Express RequestHandler function
 * @returns Express RequestHandler with automatic Promise rejection handling
 *
 * @example
 * ```typescript
 * export const getDoctor = catchAsync(async (req, res) => {
 *   const result = await DoctorService.getById(req.params.id);
 *   sendResponse(res, { statusCode: 200, success: true, message: 'Doctor found', data: result });
 * });
 * ```
 */
export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error: unknown) {
            next(error);
        }
    }
}
