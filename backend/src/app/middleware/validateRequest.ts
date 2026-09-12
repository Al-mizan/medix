import { NextFunction, Request, Response } from "express";
import z from "zod";

/**
 * Express middleware factory that validates incoming `req.body` against a Zod schema.
 * Automatically parses nested JSON string payloads (e.g. from multipart form data uploads)
 * and sanitizes `req.body` with parsed schema data.
 *
 * @param zodSchema - The Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * router.post('/login', validateRequest(AuthValidation.loginZodSchema), AuthController.login);
 * ```
 */
export const validateRequest = (zodSchema: z.ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(req.body.data){
            req.body = JSON.parse(req.body.data)
        }
        const parsedResult = zodSchema.safeParse(req.body)

        if (!parsedResult.success) {
            next(parsedResult.error)
        }
        //sanitizing the data
        req.body = parsedResult.data;

        next();
    }
}