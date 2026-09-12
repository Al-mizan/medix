import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
    password: z.string("Password is required").min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
    doctor: z.object({
        name: z.string("Doctor name is required and must be string").min(3, "Doctor name must be at least 3 characters long").max(50, "Doctor name must be less than 50 characters long"),
        email: z.email("Valid email is required"),
        profilePhoto: z.string("Profile photo URL must be a string").optional(),
        contactNumber: z.string("Contact number must be a string").min(11, "Contact number must be at least 11 characters long").max(14, "Contact number must be at most 14 characters long").optional(),
        address: z.string("Address must be a string").optional(),
        registrationNumber: z.string("Registration number is required"),
        experience: z.number("Experience must be a number").int().nonnegative().optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE], "Gender must be one of 'MALE', 'FEMALE'"),
        appointmentFee: z.number("Appointment fee must be a number").nonnegative("Appointment fee must be a non-negative number"),
        qualification: z.string("Qualification must be a string").min(2, "Qualification must be at least 2 characters long").max(100, "Qualification must be less than 100 characters long"),
        currentWorkingPlace: z.string("Current working place must be a string").min(2, "Current working place must be at least 2 characters long").max(100, "Current working place must be less than 100 characters long"),
        designation: z.string("Designation must be a string").min(2, "Designation must be at least 2 characters long").max(100, "Designation must be less than 100 characters long"),
    }),
    specialties: z.array(z.uuid("Specialty title must be a string")).min(1, "At least one specialty is required"),
})

export const createAdminZodSchema = z.object({
    password: z.string("Password is required").min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    admin: z.object({
        name: z.string("Name is required and must be string").min(5, "Name must be at least 5 characters").max(30, "Name must be at most 30 characters"),
        email: z.email("Invalid email address"),
        contactNumber: z.string("Contact number is required").min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 15 characters").optional(),
        profilePhoto: z.url("Profile photo must be a valid URL").optional(),
    }),
    role: z.enum(["ADMIN", "SUPER_ADMIN"], "Role must be either ADMIN or SUPER_ADMIN")
})