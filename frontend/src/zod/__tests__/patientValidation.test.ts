import { describe, expect, it } from "vitest";
import {
    patientHealthDataFormSchema,
    patientHealthDataServerSchema,
} from "../patient.validation";

describe("patientHealthDataFormSchema", () => {
    it("accepts valid full health record form values", () => {
        const result = patientHealthDataFormSchema.safeParse({
            gender: "MALE",
            dateOfBirth: "1990-05-15",
            maritalStatus: "Married",
            bloodGroup: "O_POSITIVE",
            height: "178",
            weight: "75",
            hasAllergies: true,
            hasDiabetes: false,
            hasPastSurgeries: false,
            smokingStatus: false,
            pregnancyStatus: false,
            recentAnxiety: true,
            recentDepression: false,
            dietaryPreferences: "Vegetarian",
            immunizationStatus: "Fully Vaccinated",
            mentalHealthHistory: "None reported",
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.bloodGroup).toBe("O_POSITIVE");
            expect(result.data.hasAllergies).toBe(true);
            expect(result.data.recentAnxiety).toBe(true);
        }
    });

    it("rejects invalid blood group", () => {
        const result = patientHealthDataFormSchema.safeParse({
            gender: "FEMALE",
            dateOfBirth: "1995-10-20",
            bloodGroup: "INVALID_GROUP",
            height: "165",
            weight: "60",
        });

        expect(result.success).toBe(false);
    });

    it("rejects invalid date of birth", () => {
        const result = patientHealthDataFormSchema.safeParse({
            gender: "FEMALE",
            dateOfBirth: "not-a-date",
            bloodGroup: "A_POSITIVE",
            height: "165",
            weight: "60",
        });

        expect(result.success).toBe(false);
    });

    it("defaults boolean switches to false when not provided", () => {
        const result = patientHealthDataFormSchema.safeParse({
            gender: "OTHER",
            dateOfBirth: "2000-01-01",
            bloodGroup: "B_POSITIVE",
            height: "170",
            weight: "65",
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.hasAllergies).toBe(false);
            expect(result.data.hasDiabetes).toBe(false);
            expect(result.data.smokingStatus).toBe(false);
            expect(result.data.hasPastSurgeries).toBe(false);
        }
    });
});

describe("patientHealthDataServerSchema", () => {
    it("accepts partial updates for PATCH payload", () => {
        const result = patientHealthDataServerSchema.safeParse({
            height: "180",
            weight: "78",
            smokingStatus: false,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.height).toBe("180");
            expect(result.data.weight).toBe("78");
            expect(result.data.smokingStatus).toBe(false);
        }
    });

    it("accepts valid ISO date or YYYY-MM-DD", () => {
        const result = patientHealthDataServerSchema.safeParse({
            dateOfBirth: "1988-12-05",
        });

        expect(result.success).toBe(true);
    });

    it("rejects malformed date in server payload", () => {
        const result = patientHealthDataServerSchema.safeParse({
            dateOfBirth: "invalid-date-string",
        });

        expect(result.success).toBe(false);
    });
});
