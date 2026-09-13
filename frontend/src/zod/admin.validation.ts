import { z } from "zod";

export const createAdminFormZodSchema = z.object({
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must be at most 20 characters"),
    name: z
        .string()
        .trim()
        .min(5, "Name must be at least 5 characters")
        .max(30, "Name must be at most 30 characters"),
    email: z.string().trim().email("Invalid email address"),
    contactNumber: z
        .string()
        .trim()
        .refine(
            (val) => val === "" || (val.length >= 11 && val.length <= 14),
            "Contact number must be between 11 and 14 characters"
        )
        .optional(),
    role: z.enum(["ADMIN", "SUPER_ADMIN"], {
        message: "Role must be either ADMIN or SUPER_ADMIN",
    }),
});

export type ICreateAdminFormValues = z.infer<typeof createAdminFormZodSchema>;

export const updateAdminFormZodSchema = z.object({
    name: z
        .string()
        .trim()
        .min(5, "Name must be at least 5 characters")
        .max(30, "Name must be at most 30 characters")
        .optional(),
    contactNumber: z
        .string()
        .trim()
        .refine(
            (val) => val === "" || (val.length >= 11 && val.length <= 14),
            "Contact number must be between 11 and 14 characters"
        )
        .optional(),
});

export type IUpdateAdminFormValues = z.infer<typeof updateAdminFormZodSchema>;
