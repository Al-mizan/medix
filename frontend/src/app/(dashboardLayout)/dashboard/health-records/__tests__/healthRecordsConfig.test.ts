import { describe, it, expect } from "vitest";
import nextConfig from "../../../../../../next.config";

describe("Health Records & Server Actions Configuration", () => {
    it("should configure serverActions bodySizeLimit to 10mb in nextConfig", () => {
        expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe("10mb");
    });

    it("should match or exceed the 10MB medical report upload ceiling", () => {
        const configuredLimit = nextConfig.experimental?.serverActions?.bodySizeLimit;
        expect(configuredLimit).toBeDefined();

        // 10mb is 10 * 1024 * 1024 bytes
        const limitInMb = parseInt(configuredLimit as string, 10);
        expect(limitInMb).toBeGreaterThanOrEqual(10);
    });
});
