import { z } from "zod";

export const createSpecialtyFormZodSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(50, "Title must be at most 50 characters"),
    description: z
        .string()
        .trim()
        .max(255, "Description must be at most 255 characters")
        .optional(),
});

export type ICreateSpecialtyFormValues = z.infer<typeof createSpecialtyFormZodSchema>;

export const updateSpecialtyFormZodSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(50, "Title must be at most 50 characters"),
    description: z
        .string()
        .trim()
        .max(255, "Description must be at most 255 characters")
        .optional(),
});

export type IUpdateSpecialtyFormValues = z.infer<typeof updateSpecialtyFormZodSchema>;
