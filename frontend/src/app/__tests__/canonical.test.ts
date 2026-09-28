import { describe, it, expect, vi } from "vitest";

// Mock services that might be imported by pages
vi.mock("@/services/doctor.services", () => ({
  getAllSpecialties: vi.fn().mockResolvedValue([]),
  getDoctors: vi.fn().mockResolvedValue([]),
  getDoctorById: vi.fn().mockResolvedValue({
    data: {
      id: "doc-123",
      name: "Dr. Sarah Jenkins",
      designation: "Senior Cardiologist",
      qualification: "MBBS, MD",
    },
  }),
}));

vi.mock("@/services/auth.services", () => ({
  getUserInfo: vi.fn().mockResolvedValue(null),
}));

import { metadata as homeMetadata } from "../(commonLayout)/page";
import { metadata as consultationMetadata } from "../(commonLayout)/consultation/page";
import { metadata as loginMetadata } from "../(commonLayout)/(authRouteGroup)/login/page";
import { metadata as registerMetadata } from "../(commonLayout)/(authRouteGroup)/register/page";
import { metadata as forgotPasswordMetadata } from "../(commonLayout)/(authRouteGroup)/forgot-password/page";
import { metadata as resetPasswordMetadata } from "../(commonLayout)/(authRouteGroup)/reset-password/page";
import { metadata as verifyEmailMetadata } from "../(commonLayout)/(authRouteGroup)/verify-email/page";
import { metadata as privacyMetadata } from "../(commonLayout)/privacy/page";
import { metadata as termsMetadata } from "../(commonLayout)/terms/page";
import { metadata as thankYouMetadata } from "../(commonLayout)/thank-you/page";
import { metadata as diagnosticsMetadata } from "../(commonLayout)/diagnostics/page";
import { metadata as healthPlansMetadata } from "../(commonLayout)/health-plans/page";
import { metadata as medicineMetadata } from "../(commonLayout)/medicine/page";
import { metadata as ngosMetadata } from "../(commonLayout)/ngos/page";
import { generateMetadata as generateDoctorMetadata } from "../(commonLayout)/consultation/doctor/[id]/page";

describe("Canonical Tag Verification across Public Routes", () => {
  it("enforces canonical URL on homepage", () => {
    expect(homeMetadata.alternates?.canonical).toBe("/");
  });

  it("enforces canonical URL on consultation directory", () => {
    expect(consultationMetadata.alternates?.canonical).toBe("/consultation");
  });

  it("enforces canonical URL on auth routes", () => {
    expect(loginMetadata.alternates?.canonical).toBe("/login");
    expect(registerMetadata.alternates?.canonical).toBe("/register");
    expect(forgotPasswordMetadata.alternates?.canonical).toBe("/forgot-password");
    expect(resetPasswordMetadata.alternates?.canonical).toBe("/reset-password");
    expect(verifyEmailMetadata.alternates?.canonical).toBe("/verify-email");
  });

  it("enforces canonical URL on informational routes", () => {
    expect(privacyMetadata.alternates?.canonical).toBe("/privacy");
    expect(termsMetadata.alternates?.canonical).toBe("/terms");
    expect(thankYouMetadata.alternates?.canonical).toBe("/thank-you");
    expect(diagnosticsMetadata.alternates?.canonical).toBe("/diagnostics");
    expect(healthPlansMetadata.alternates?.canonical).toBe("/health-plans");
    expect(medicineMetadata.alternates?.canonical).toBe("/medicine");
    expect(ngosMetadata.alternates?.canonical).toBe("/ngos");
  });

  it("generates dynamic canonical URL for doctor profile route", async () => {
    const meta = await generateDoctorMetadata({
      params: Promise.resolve({ id: "doc-123" }),
    });

    expect(meta.alternates?.canonical).toBe("/consultation/doctor/doc-123");
  });
});
