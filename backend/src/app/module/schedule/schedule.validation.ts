import z from "zod";

const createScheduleZodSchema = z
    .object({
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),
        startTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
            message: "Invalid time format",
        }),
        endTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
            message: "Invalid time format",
        }),
    })
    .refine(
        (data) => new Date(data.endDate).getTime() >= new Date(data.startDate).getTime(),
        {
            message: "End date cannot be earlier than start date",
            path: ["endDate"],
        }
    )
    .refine(
        (data) => {
            const [sh, sm] = data.startTime.split(":").map(Number);
            const [eh, em] = data.endTime.split(":").map(Number);
            return eh * 60 + em - (sh * 60 + sm) >= 30;
        },
        {
            message: "End time must be later than start time by at least 30 minutes",
            path: ["endTime"],
        }
    );


const updateScheduleZodSchema = z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }).optional(),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }).optional(),
    startTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format",
    }).optional(),
    endTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format",
    }).optional(),
});

export const ScheduleValidation = {
    createScheduleZodSchema,
    updateScheduleZodSchema
}