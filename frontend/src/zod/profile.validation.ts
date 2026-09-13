import { z } from "zod";

export const patientProfileEditSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    contactNumber: z
        .string()
        .trim()
        .max(20, "Contact number must be less than 20 characters"),
    address: z
        .string()
        .trim()
        .max(200, "Address must be less than 200 characters"),
});

export type IPatientProfileEditValues = z.infer<typeof patientProfileEditSchema>;

export const doctorProfileEditSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    contactNumber: z
        .string()
        .trim()
        .max(20, "Contact number must be less than 20 characters"),
    address: z
        .string()
        .trim()
        .max(200, "Address must be less than 200 characters"),
});

export type IDoctorProfileEditValues = z.infer<typeof doctorProfileEditSchema>;

export const adminProfileEditSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    contactNumber: z
        .string()
        .trim()
        .max(20, "Contact number must be less than 20 characters"),
});

export type IAdminProfileEditValues = z.infer<typeof adminProfileEditSchema>;
