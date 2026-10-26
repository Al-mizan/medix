import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express, { Request, Response } from "express";
import { redisService } from "../src/app/lib/redis";
import {
    createRateLimiter,
    getClientIp,
    rateLimiter,
    authRateLimiter,
    generalRateLimiter,
} from "../src/app/middleware/rateLimit";

describe("TICK-021: Sliding-Window Rate Limiter", () => {
    beforeEach(() => {
        redisService.clearMemoryRateLimits();
    });

    describe("Client IP Extraction", () => {
        it("should extract IP from x-forwarded-for string", () => {
            const req = {
                headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
            } as unknown as Request;
            expect(getClientIp(req)).toBe("203.0.113.195");
        });

        it("should extract IP from x-forwarded-for array", () => {
            const req = {
                headers: { "x-forwarded-for": ["198.51.100.1", "198.51.100.2"] },
            } as unknown as Request;
            expect(getClientIp(req)).toBe("198.51.100.1");
        });

        it("should fallback to req.ip or socket remote address", () => {
            const req = {
                headers: {},
                ip: "192.168.1.50",
            } as unknown as Request;
            expect(getClientIp(req)).toBe("192.168.1.50");
        });
    });

    describe("RedisService Sliding-Window Evaluation", () => {
        it("should allow requests within limit and track remaining tokens", async () => {
            const key = "ratelimit:test:127.0.0.1";
            const res1 = await redisService.evaluateRateLimit(key, 3, 60000);
            expect(res1.allowed).toBe(true);
            expect(res1.remaining).toBe(2);

            const res2 = await redisService.evaluateRateLimit(key, 3, 60000);
            expect(res2.allowed).toBe(true);
            expect(res2.remaining).toBe(1);

            const res3 = await redisService.evaluateRateLimit(key, 3, 60000);
            expect(res3.allowed).toBe(true);
            expect(res3.remaining).toBe(0);

            // 4th request exceeds limit
            const res4 = await redisService.evaluateRateLimit(key, 3, 60000);
            expect(res4.allowed).toBe(false);
            expect(res4.remaining).toBe(0);
            expect(res4.retryAfter).toBeGreaterThan(0);
        });
    });

    describe("Middleware Tier Enforcement", () => {
        let testApp: express.Application;

        beforeEach(() => {
            testApp = express();
            testApp.use(express.json());

            // Mock webhook endpoint before rate limiter
            testApp.post("/webhook", (req: Request, res: Response) => {
                res.status(200).json({ received: true });
            });

            // Rate limiter middleware
            testApp.use(rateLimiter);

            // Mock routes
            testApp.post("/api/auth/sign-in", (req: Request, res: Response) => {
                res.status(200).json({ success: true, message: "signed in" });
            });

            testApp.post("/api/v1/auth/login", (req: Request, res: Response) => {
                res.status(200).json({ success: true, message: "logged in" });
            });

            testApp.get("/api/v1/doctors", (req: Request, res: Response) => {
                res.status(200).json({ success: true, doctors: [] });
            });

            testApp.get("/api/v1/auth/me", (req: Request, res: Response) => {
                res.status(200).json({ success: true, data: { id: "user-1", email: "user@medix.com" } });
            });

            testApp.get("/api-docs", (req: Request, res: Response) => {
                res.status(200).send("docs");
            });
        });

        it("Auth Tier: allows 10 requests and rejects 11th request with 429", async () => {
            const ip = "10.0.0.1";

            // Fire 10 allowed requests
            for (let i = 1; i <= 10; i++) {
                const res = await request(testApp)
                    .post("/api/auth/sign-in")
                    .set("X-Forwarded-For", ip);

                expect(res.status).toBe(200);
                expect(res.headers["x-ratelimit-limit"]).toBe("10");
                expect(res.headers["x-ratelimit-remaining"]).toBe((10 - i).toString());
            }

            // 11th request must receive 429 Too Many Requests
            const blockedRes = await request(testApp)
                .post("/api/auth/sign-in")
                .set("X-Forwarded-For", ip);

            expect(blockedRes.status).toBe(429);
            expect(blockedRes.body.success).toBe(false);
            expect(blockedRes.body.message).toMatch(/Too Many Requests/i);
            expect(blockedRes.headers["x-ratelimit-limit"]).toBe("10");
            expect(blockedRes.headers["x-ratelimit-remaining"]).toBe("0");
            expect(blockedRes.headers["retry-after"]).toBeDefined();
            expect(Number(blockedRes.headers["retry-after"])).toBeGreaterThan(0);
        });

        it("Auth Tier: distinguishes different client IPs", async () => {
            const ip1 = "10.0.0.2";
            const ip2 = "10.0.0.3";

            // Exhaust ip1
            for (let i = 1; i <= 10; i++) {
                await request(testApp)
                    .post("/api/v1/auth/login")
                    .set("X-Forwarded-For", ip1);
            }

            const resBlocked = await request(testApp)
                .post("/api/v1/auth/login")
                .set("X-Forwarded-For", ip1);
            expect(resBlocked.status).toBe(429);

            // ip2 should still be allowed
            const resFresh = await request(testApp)
                .post("/api/v1/auth/login")
                .set("X-Forwarded-For", ip2);
            expect(resFresh.status).toBe(200);
            expect(resFresh.headers["x-ratelimit-remaining"]).toBe("9");
        });

        it("General Tier: provides 100 requests limit", async () => {
            const res = await request(testApp)
                .get("/api/v1/doctors")
                .set("X-Forwarded-For", "10.0.0.4");

            expect(res.status).toBe(200);
            expect(res.headers["x-ratelimit-limit"]).toBe("100");
            expect(res.headers["x-ratelimit-remaining"]).toBe("99");
        });

        it("Auth Profile Exemption: /api/v1/auth/me is routed to general tier (100 limit)", async () => {
            const res = await request(testApp)
                .get("/api/v1/auth/me")
                .set("X-Forwarded-For", "10.0.0.9");

            expect(res.status).toBe(200);
            expect(res.headers["x-ratelimit-limit"]).toBe("100");
            expect(res.headers["x-ratelimit-remaining"]).toBe("99");
        });

        it("Exemptions: /webhook bypasses rate limiting", async () => {
            for (let i = 1; i <= 15; i++) {
                const res = await request(testApp)
                    .post("/webhook")
                    .set("X-Forwarded-For", "10.0.0.5");
                expect(res.status).toBe(200);
                expect(res.headers["x-ratelimit-limit"]).toBeUndefined();
            }
        });
    });
});
