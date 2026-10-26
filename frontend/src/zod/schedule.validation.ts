import {
    type ICreateSchedulePayload,
    type IUpdateSchedulePayload,
} from "@/types/schedule.types"
import { z } from "zod"

const validTimeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/

export const baseScheduleSchema = z.object({
  startDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
  startTime: z.string().regex(validTimeRegex, "Invalid start time (HH:MM)"),
  endTime: z.string().regex(validTimeRegex, "Invalid end time (HH:MM)"),
})

export const withScheduleRefinements = <TSchema extends typeof baseScheduleSchema>(schema: TSchema) => {
  return schema
    .refine(
      (value) => new Date(value.endDate).getTime() >= new Date(value.startDate).getTime(),
      {
        message: "End date cannot be earlier than start date",
        path: ["endDate"],
      },
    )
    .refine((value) => {
      const [sh, sm] = value.startTime.split(":").map(Number);
      const [eh, em] = value.endTime.split(":").map(Number);
      return (eh * 60 + em) - (sh * 60 + sm) >= 30;
    }, {
      message: "End time must be at least 30 minutes after start time",
      path: ["endTime"],
    })
}

export const createScheduleFormZodSchema = withScheduleRefinements(baseScheduleSchema)

export const editScheduleFormZodSchema = withScheduleRefinements(baseScheduleSchema)

export const createScheduleServerZodSchema = withScheduleRefinements(baseScheduleSchema) satisfies z.ZodType<ICreateSchedulePayload>

export const updateScheduleServerZodSchema = withScheduleRefinements(baseScheduleSchema) satisfies z.ZodType<IUpdateSchedulePayload>

export type ICreateScheduleFormValues = z.infer<typeof createScheduleFormZodSchema>
export type IEditScheduleFormValues = z.infer<typeof editScheduleFormZodSchema>
