import { z } from "zod";

export const GenderValues = ["MALE", "FEMALE", "OTHER"] as const;
export const BloodGroupValues = [
    "A_POSITIVE",
    "A_NEGATIVE",
    "B_POSITIVE",
    "B_NEGATIVE",
    "AB_POSITIVE",
    "AB_NEGATIVE",
    "O_POSITIVE",
    "O_NEGATIVE",
] as const;

export const patientHealthDataFormSchema = z.object({
    // Demographics
    gender: z.enum(GenderValues, {
        message: "Please select a valid gender",
    }),
    dateOfBirth: z
        .string()
        .min(1, "Date of birth is required")
        .refine(
            (date) => !isNaN(Date.parse(date)),
            "Please provide a valid date of birth"
        ),
    maritalStatus: z.string().optional(),

    // Biometrics & Vitals
    bloodGroup: z.enum(BloodGroupValues, {
        message: "Please select a valid blood group",
    }),
    height: z.string().min(1, "Height is required"),
    weight: z.string().min(1, "Weight is required"),

    // Chronic Conditions & Allergies
    hasAllergies: z.boolean().default(false),
    hasDiabetes: z.boolean().default(false),
    hasPastSurgeries: z.boolean().default(false),

    // Lifestyle & Clinical History
    smokingStatus: z.boolean().default(false),
    dietaryPreferences: z.string().optional(),
    pregnancyStatus: z.boolean().default(false),
    mentalHealthHistory: z.string().optional(),
    immunizationStatus: z.string().optional(),
    recentAnxiety: z.boolean().default(false),
    recentDepression: z.boolean().default(false),
});

export type IPatientHealthDataFormValues = z.infer<typeof patientHealthDataFormSchema>;

export const patientHealthDataServerSchema = z.object({
    gender: z.enum(GenderValues).optional(),
    dateOfBirth: z
        .string()
        .refine(
            (date) => !date || !isNaN(Date.parse(date)),
            "Invalid date format"
        )
        .optional(),
    bloodGroup: z.enum(BloodGroupValues).optional(),
    hasAllergies: z.boolean().optional(),
    hasDiabetes: z.boolean().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    smokingStatus: z.boolean().optional(),
    dietaryPreferences: z.string().optional(),
    pregnancyStatus: z.boolean().optional(),
    mentalHealthHistory: z.string().optional(),
    immunizationStatus: z.string().optional(),
    hasPastSurgeries: z.boolean().optional(),
    recentAnxiety: z.boolean().optional(),
    recentDepression: z.boolean().optional(),
    maritalStatus: z.string().optional(),
});

export type IPatientHealthDataServerPayload = z.infer<typeof patientHealthDataServerSchema>;
