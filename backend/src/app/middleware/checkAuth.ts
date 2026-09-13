import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookies";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { jwtUtils } from "../utils/jwt";
import { envVars } from '../config/env';

/**
 * Express middleware factory enforcing dual authentication and role-based authorization.
 * Verifies BetterAuth active sessions, checks user active status in PostgreSQL, and validates
 * signed JWT access tokens against allowed user roles.
 *
 * @param authRoles - Whitelisted roles permitted to access the guarded route. Empty array permits any authenticated user.
 * @returns Express middleware function `(req, res, next)`
 *
 * @throws {AppError} 401 UNAUTHORIZED if session/token is missing, expired, or invalid
 * @throws {AppError} 403 FORBIDDEN if user status is BLOCKED/DELETED or role is not authorized
 *
 * @example
 * ```typescript
 * router.post('/create-doctor', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.createDoctor);
 * ```
 */
export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // session token verification
        const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");
        if (!sessionToken) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized: No session token provided");
        }
        const sessionExists = await prisma.session.findFirst({
            where: {
                token: sessionToken,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            }
        });

        if (!sessionExists || !sessionExists.user) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized: Invalid or expired session");
        }

        const user = sessionExists.user;
        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentageTimeRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentageTimeRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());

            console.log("Session Expiring Soon!!!");
        }

        if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
            throw new AppError(status.FORBIDDEN, "Unauthorized: User is not active");
        }
        if (user.isDeleted) {
            throw new AppError(status.FORBIDDEN, "Unauthorized: User is deleted");
        }
        if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
            throw new AppError(status.FORBIDDEN, "Unauthorized: You don't have permission to access this resource");
        }

        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role as Role,
        };

        // access token verification (from cookie or Authorization header)
        let accessToken = cookieUtils.getCookie(req, "accessToken");
        if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
            accessToken = req.headers.authorization.split(" ")[1];
        }

        if (!accessToken) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized: No access token provided");
        }
        const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
        if (!verifiedToken.success || !verifiedToken.data) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized: Invalid access token");
        }
        if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data.role as Role)) {
            throw new AppError(status.FORBIDDEN, "Unauthorized: You don't have permission to access this resource");
        }

        next();
    } catch (error: unknown) {
        next(error);
    }
};