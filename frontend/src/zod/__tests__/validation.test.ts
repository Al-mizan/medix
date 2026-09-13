import { describe, expect, it } from "vitest";
import { changePasswordZodSchema } from "../auth.validation";
import {
    adminProfileEditSchema,
    doctorProfileEditSchema,
    patientProfileEditSchema,
} from "../profile.validation";

describe("changePasswordZodSchema", () => {
    it("accepts valid matching passwords of length >= 8", () => {
        const result = changePasswordZodSchema.safeParse({
            currentPassword: "oldpassword123",
            newPassword: "newpassword123",
            confirmPassword: "newpassword123",
        });
        expect(result.success).toBe(true);
    });

    it("rejects when newPassword and confirmPassword do not match", () => {
        const result = changePasswordZodSchema.safeParse({
            currentPassword: "oldpassword123",
            newPassword: "newpassword123",
            confirmPassword: "differentpassword",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Passwords do not match");
        }
    });

    it("rejects when newPassword is less than 8 characters", () => {
        const result = changePasswordZodSchema.safeParse({
            currentPassword: "oldpassword123",
            newPassword: "short",
            confirmPassword: "short",
        });
        expect(result.success).toBe(false);
    });

    it("rejects when currentPassword is empty", () => {
        const result = changePasswordZodSchema.safeParse({
            currentPassword: "",
            newPassword: "newpassword123",
            confirmPassword: "newpassword123",
        });
        expect(result.success).toBe(false);
    });
});

describe("profile validation schemas", () => {
    it("validates patient profile values", () => {
        const valid = patientProfileEditSchema.safeParse({
            name: "Jane Doe",
            contactNumber: "01712345678",
            address: "123 Main St",
        });
        expect(valid.success).toBe(true);

        const invalidName = patientProfileEditSchema.safeParse({
            name: "J",
        });
        expect(invalidName.success).toBe(false);
    });

    it("validates doctor profile values", () => {
        const valid = doctorProfileEditSchema.safeParse({
            name: "Dr. Smith",
            contactNumber: "01812345678",
            address: "Hospital Road",
        });
        expect(valid.success).toBe(true);
    });

    it("validates admin profile values", () => {
        const valid = adminProfileEditSchema.safeParse({
            name: "Admin Super",
            contactNumber: "01912345678",
        });
        expect(valid.success).toBe(true);
    });
});
