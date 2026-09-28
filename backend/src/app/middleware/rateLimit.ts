import { NextFunction, Request, Response } from "express";
import { redisService } from "../lib/redis";

export interface RateLimiterOptions {
    tier: "auth" | "general" | string;
    limit: number;
    windowSeconds: number;
}

/**
 * Extracts client IP from X-Forwarded-For header or Express req.ip.
 */
export const getClientIp = (req: Request): string => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
        return forwarded[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

/**
 * Factory creating an Express middleware for sliding-window rate limiting.
 */
export const createRateLimiter = (options: RateLimiterOptions) => {
    const { tier, limit, windowSeconds } = options;
    const windowMs = windowSeconds * 1000;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const clientIp = getClientIp(req);
            const key = `ratelimit:${tier}:${clientIp}`;

            const result = await redisService.evaluateRateLimit(
                key,
                limit,
                windowMs
            );

            res.setHeader("X-RateLimit-Limit", limit.toString());
            res.setHeader("X-RateLimit-Remaining", Math.max(0, result.remaining).toString());

            if (!result.allowed) {
                res.setHeader("Retry-After", result.retryAfter.toString());
                res.status(429).json({
                    success: false,
                    message: "Too Many Requests. Please try again later.",
                    retryAfter: result.retryAfter,
                });
                return;
            }

            next();
        } catch (error) {
            console.error(`Rate limiting error for tier ${tier}:`, error);
            // Fail open to avoid breaking user requests if unexpected error occurs
            next();
        }
    };
};

/**
 * Auth Tier: 10 requests per 60 seconds per IP.
 */
export const authRateLimiter = createRateLimiter({
    tier: "auth",
    limit: 10,
    windowSeconds: 60,
});

/**
 * General API Tier: 100 requests per 60 seconds per IP.
 */
export const generalRateLimiter = createRateLimiter({
    tier: "general",
    limit: 100,
    windowSeconds: 60,
});

/**
 * Global rate limiter middleware routing requests to appropriate tiers or bypassing exemptions.
 */
export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const path = req.originalUrl || req.url || req.path;

    // 1. Stripe webhook exemption
    if (path === "/webhook" || path.startsWith("/webhook/")) {
        return next();
    }

    // Documentation routes exemption
    if (path.startsWith("/api-docs") || path === "/api/v1/openapi.json") {
        return next();
    }

    // 2. Auth Tier (/api/auth/*, /api/v1/auth/*)
    if (path.startsWith("/api/auth") || path.startsWith("/api/v1/auth")) {
        return authRateLimiter(req, res, next);
    }

    // 3. General API Tier (/api/v1/*)
    if (path.startsWith("/api/v1")) {
        return generalRateLimiter(req, res, next);
    }

    // Other routes pass through
    next();
};
