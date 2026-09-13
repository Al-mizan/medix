import z from "zod";

const createDoctorScheduleZodSchema = z.object({
    scheduleIds: z
        .array(z.string().min(1, "Schedule ID cannot be empty"))
        .min(1, "At least one schedule ID is required"),
});

const updateDoctorScheduleZodSchema = z.object({
    scheduleIds: z
        .array(
            z.object({
                id: z.string().min(1, "Schedule ID cannot be empty"),
                shouldDelete: z.boolean({
                    message: "shouldDelete flag is required",
                }),
            })
        )
        .min(1, "At least one schedule item is required"),
});

export const DoctorScheduleValidation = {
    createDoctorScheduleZodSchema,
    updateDoctorScheduleZodSchema,
};
