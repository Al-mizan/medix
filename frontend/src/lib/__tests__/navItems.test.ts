import { describe, expect, it } from "vitest";
import { getCommonNavItems, getNavItemsByRole } from "../navItems";

describe("navItems", () => {
    it("getCommonNavItems includes /change-password with a leading slash", () => {
        const items = getCommonNavItems("PATIENT");
        const settingsSection = items.find((s) => s.title === "Settings");
        expect(settingsSection).toBeDefined();

        const changePasswordItem = settingsSection?.items.find(
            (i) => i.title === "Change Password"
        );
        expect(changePasswordItem).toBeDefined();
        expect(changePasswordItem?.href).toBe("/change-password");
        expect(changePasswordItem?.href.startsWith("/")).toBe(true);
    });

    it("getNavItemsByRole includes /change-password for all roles without relative path", () => {
        const roles = ["PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN"] as const;
        for (const role of roles) {
            const sections = getNavItemsByRole(role);
            const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));
            expect(allHrefs).toContain("/change-password");
            expect(allHrefs).not.toContain("change-password");
        }
    });

    it("patientNavItems includes /dashboard/my-prescriptions and /dashboard/health-records under Medical Records", () => {
        const sections = getNavItemsByRole("PATIENT");
        const medicalSection = sections.find((s) => s.title === "Medical Records");
        expect(medicalSection).toBeDefined();

        const prescriptionsItem = medicalSection?.items.find(
            (i) => i.href === "/dashboard/my-prescriptions"
        );
        expect(prescriptionsItem).toBeDefined();
        expect(prescriptionsItem?.title).toBe("My Prescriptions");

        const healthRecordsItem = medicalSection?.items.find(
            (i) => i.href === "/dashboard/health-records"
        );
        expect(healthRecordsItem).toBeDefined();
        expect(healthRecordsItem?.title).toBe("Health Records");
    });

    it("patientNavItems includes /dashboard/my-reviews with Star icon", () => {
        const sections = getNavItemsByRole("PATIENT");
        const allItems = sections.flatMap((s) => s.items);
        const myReviewsItem = allItems.find((i) => i.href === "/dashboard/my-reviews");
        expect(myReviewsItem).toBeDefined();
        expect(myReviewsItem?.title).toBe("My Reviews");
        expect(myReviewsItem?.icon).toBe("Star");
    });
});
