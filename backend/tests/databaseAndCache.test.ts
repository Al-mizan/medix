import { describe, it, expect, beforeEach, vi } from "vitest";
import { redisService, computeQueryHash } from "../src/app/lib/redis";
import fs from "fs";
import path from "path";

describe("TICK-023 & TICK-024: Database Optimization & Redis Caching Layer", () => {
    beforeEach(() => {
        redisService.clearMemoryCache();
    });

    describe("TICK-023: Database Schema & Query Optimization", () => {
        it("appointment.prisma schema contains composite index idx_appointment_status_createdAt", () => {
            const schemaPath = path.resolve(
                process.cwd(),
                "prisma/schema/appointment.prisma"
            );
            const schemaContent = fs.readFileSync(schemaPath, "utf-8");

            expect(schemaContent).toMatch(
                /@@index\(\[status,\s*createdAt\],\s*name:\s*"idx_appointment_status_createdAt"\)/
            );
        });

        it("cancelUnpaidAppointments query actively filters on status and createdAt", () => {
            const servicePath = path.resolve(
                process.cwd(),
                "src/app/module/appointment/appointment.service.ts"
            );
            const serviceContent = fs.readFileSync(servicePath, "utf-8");

            expect(serviceContent).toMatch(/status:\s*AppointmentStatus\.SCHEDULED/);
            expect(serviceContent).toMatch(/createdAt:\s*\{\s*lte:\s*thirtyMinutesAgo,?\s*\}/);
        });
    });

    describe("TICK-024: Redis Caching & Invalidation Layer", () => {
        describe("computeQueryHash", () => {
            it("produces deterministic query hashes", () => {
                const hash1 = computeQueryHash({ limit: 10, page: 1, searchTerm: "cardio" });
                const hash2 = computeQueryHash({ page: 1, searchTerm: "cardio", limit: 10 });
                const hash3 = computeQueryHash({ page: 2, limit: 10 });

                expect(hash1).toBe(hash2);
                expect(hash1).not.toBe(hash3);
            });

            it("returns 'all' for empty query parameters", () => {
                expect(computeQueryHash({})).toBe("all");
                expect(computeQueryHash({ empty: null, unset: undefined })).toBe("all");
            });
        });

        describe("withCache Helper", () => {
            it("caches fetcher results and avoids re-executing fetcher on cache hit", async () => {
                let executionCount = 0;
                const fetcher = async () => {
                    executionCount++;
                    return { id: "doc-1", name: "Dr. Alice" };
                };

                const res1 = await redisService.withCache("test:doc:1", 60, fetcher);
                expect(res1).toEqual({ id: "doc-1", name: "Dr. Alice" });
                expect(executionCount).toBe(1);

                // Second call must return from cache
                const start = performance.now();
                const res2 = await redisService.withCache("test:doc:1", 60, fetcher);
                const duration = performance.now() - start;

                expect(res2).toEqual({ id: "doc-1", name: "Dr. Alice" });
                expect(executionCount).toBe(1); // Fetcher was NOT called again
                expect(duration).toBeLessThan(15); // Sub-15ms cache hit latency
            });

            it("falls back to direct fetcher invocation when Redis is unavailable without throwing", async () => {
                let executionCount = 0;
                const fetcher = async () => {
                    executionCount++;
                    return "fallback-data";
                };

                // Spy on redisService.get to simulate unexpected redis error
                const getSpy = vi.spyOn(redisService, "get").mockRejectedValueOnce(new Error("Connection reset"));
                const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

                const res = await redisService.withCache("test:fallback", 60, fetcher);
                expect(res).toBe("fallback-data");
                expect(executionCount).toBe(1);
                expect(warnSpy).toHaveBeenCalledWith(
                    expect.stringContaining("Redis withCache GET error"),
                    expect.any(Error)
                );

                getSpy.mockRestore();
                warnSpy.mockRestore();
            });
        });

        describe("deleteByPattern Invalidation", () => {
            it("purges all keys matching a wildcard pattern", async () => {
                let count1 = 0;
                let count2 = 0;
                let count3 = 0;

                await redisService.withCache("doctors:list:page1", 60, async () => {
                    count1++;
                    return [{ id: 1 }];
                });

                await redisService.withCache("doctors:list:page2", 60, async () => {
                    count2++;
                    return [{ id: 2 }];
                });

                await redisService.withCache("doctors:detail:123", 60, async () => {
                    count3++;
                    return { id: 123 };
                });

                expect(count1).toBe(1);
                expect(count2).toBe(1);
                expect(count3).toBe(1);

                // Invalidate all doctors:list:*
                await redisService.deleteByPattern("doctors:list:*");

                // Next read on doctors:list:page1 must invoke fetcher again
                await redisService.withCache("doctors:list:page1", 60, async () => {
                    count1++;
                    return [{ id: 1 }];
                });
                expect(count1).toBe(2);

                // doctors:detail:123 must remain cached
                await redisService.withCache("doctors:detail:123", 60, async () => {
                    count3++;
                    return { id: 123 };
                });
                expect(count3).toBe(1);
            });
        });

        describe("Service Caching Hooks", () => {
            it("DoctorService, SpecialtyService, and ScheduleService reference redisService.withCache", () => {
                const doctorServiceCode = fs.readFileSync(
                    path.resolve(process.cwd(), "src/app/module/doctor/doctor.service.ts"),
                    "utf-8"
                );
                expect(doctorServiceCode).toMatch(/redisService\.withCache/);
                expect(doctorServiceCode).toMatch(/doctors:list:/);
                expect(doctorServiceCode).toMatch(/doctors:detail:/);
                expect(doctorServiceCode).toMatch(/deleteByPattern\("doctors:list:\*"\)/);

                const specialtyServiceCode = fs.readFileSync(
                    path.resolve(process.cwd(), "src/app/module/specialty/specialty.service.ts"),
                    "utf-8"
                );
                expect(specialtyServiceCode).toMatch(/redisService\.withCache/);
                expect(specialtyServiceCode).toMatch(/specialties:all/);
                expect(specialtyServiceCode).toMatch(/deleteByPattern\("specialties:all\*"\)/);

                const scheduleServiceCode = fs.readFileSync(
                    path.resolve(process.cwd(), "src/app/module/schedule/schedule.service.ts"),
                    "utf-8"
                );
                expect(scheduleServiceCode).toMatch(/redisService\.withCache/);
                expect(scheduleServiceCode).toMatch(/schedules:list:/);
                expect(scheduleServiceCode).toMatch(/deleteByPattern\("schedules:list:\*"\)/);
            });
        });
    });
});
