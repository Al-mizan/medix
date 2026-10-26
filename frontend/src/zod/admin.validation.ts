import { z } from "zod";

export const createAdminFormZodSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be at most 32 characters"),
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters"),
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
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters")
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
