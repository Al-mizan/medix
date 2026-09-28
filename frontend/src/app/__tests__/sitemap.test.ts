import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import sitemap from "../sitemap";

describe("sitemap generator", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SITE_URL: "https://medix.health",
      NEXT_PUBLIC_API_BASE_URL: "https://api.medix.health/api/v1",
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("includes all primary public routes in static sitemap", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain("https://medix.health");
    expect(urls).toContain("https://medix.health/consultation");
    expect(urls).toContain("https://medix.health/login");
    expect(urls).toContain("https://medix.health/register");
    expect(urls).toContain("https://medix.health/forgot-password");
    expect(urls).toContain("https://medix.health/reset-password");
    expect(urls).toContain("https://medix.health/verify-email");
    expect(urls).toContain("https://medix.health/privacy");
    expect(urls).toContain("https://medix.health/terms");
    expect(urls).toContain("https://medix.health/thank-you");
    expect(urls).toContain("https://medix.health/diagnostics");
    expect(urls).toContain("https://medix.health/health-plans");
    expect(urls).toContain("https://medix.health/medicine");
    expect(urls).toContain("https://medix.health/ngos");
  });

  it("dynamically appends verified doctor routes from API", async () => {
    const mockDoctors = [
      { id: "doc-1", updatedAt: "2026-09-01T12:00:00.000Z" },
      { id: "doc-2", updatedAt: "2026-09-10T08:30:00.000Z" },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockDoctors }),
    });

    const entries = await sitemap();
    const doctor1Entry = entries.find(
      (e) => e.url === "https://medix.health/consultation/doctor/doc-1"
    );
    const doctor2Entry = entries.find(
      (e) => e.url === "https://medix.health/consultation/doctor/doc-2"
    );

    expect(doctor1Entry).toBeDefined();
    expect(doctor1Entry?.priority).toBe(0.8);
    expect(doctor1Entry?.changeFrequency).toBe("weekly");
    expect(doctor1Entry?.lastModified).toEqual(new Date("2026-09-01T12:00:00.000Z"));

    expect(doctor2Entry).toBeDefined();
    expect(doctor2Entry?.priority).toBe(0.8);
    expect(doctor2Entry?.changeFrequency).toBe("weekly");
  });

  it("gracefully falls back to static routes if API fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

    const entries = await sitemap();
    expect(entries.length).toBeGreaterThanOrEqual(14);
    expect(entries.some((e) => e.url === "https://medix.health/consultation")).toBe(true);
  });

  it("returns static routes if API base URL is not defined", async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    const entries = await sitemap();
    expect(entries.length).toBe(14);
    expect(entries.some((e) => e.url === "https://medix.health")).toBe(true);
  });
});
