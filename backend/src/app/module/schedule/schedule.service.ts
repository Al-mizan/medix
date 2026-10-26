import { addMinutes } from "date-fns";
import status from "http-status";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { IqueryParams } from "../../interface/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateSchedulePayload, IUpdateSchedulePayload } from "./schedule.interface";
import { buildDateTime, convertDateTimetoUTC } from "./schedule.utils";
import { scheduleFilterableFields, scheduleIncludeConfig, scheduleSearchableFields } from "./schedule.constant";
import { redisService, computeQueryHash } from "../../lib/redis";

const createSchedule = async (payload: ICreateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;

    const interval = 30;

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    if (currentDate > lastDate) {
        throw new AppError(status.BAD_REQUEST, "Start date must be before or equal to end date");
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);

    if (totalMinutes < interval) {
        throw new AppError(
            status.BAD_REQUEST,
            `Time range must be at least ${interval} minutes to generate consultation slots`
        );
    }

    const schedules = [];

    while (currentDate <= lastDate) {
        let currentSlotStart = buildDateTime(currentDate, startTime);
        const daySlotEnd = buildDateTime(currentDate, endTime);

        while (addMinutes(currentSlotStart, interval) <= daySlotEnd) {
            const nextSlotEnd = addMinutes(currentSlotStart, interval);
            const utcStart = await convertDateTimetoUTC(currentSlotStart);
            const utcEnd = await convertDateTimetoUTC(nextSlotEnd);

            const scheduleData = {
                startDateTime: utcStart,
                endDateTime: utcEnd,
            };

            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime,
                },
            });

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData,
                });
                schedules.push(result);
            }

            currentSlotStart = nextSlotEnd;
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (schedules.length > 0) {
        await redisService.deleteByPattern("schedules:list:*");
    }

    return schedules;
};

const getAllSchedules = async (query: IqueryParams) => {
    const queryHash = computeQueryHash(query);
    const cacheKey = `schedules:list:${queryHash}`;

    return await redisService.withCache(cacheKey, 120, async () => {
        const queryBuilder = new QueryBuilder<Schedule, Prisma.ScheduleWhereInput, Prisma.ScheduleInclude>(
            prisma.schedule,
            query,
            {
                searchableFields: scheduleSearchableFields,
                filterableFields: scheduleFilterableFields
            }
        );

        const result = await queryBuilder
            .search()
            .filter()
            .paginate()
            .dynamicInclude(scheduleIncludeConfig)
            .sort()
            .fields()
            .execute();

        return result;
    });
}

const getScheduleById = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: {
            id: id
        }
    });
    return schedule;
}

// refactoring - doctor's appointment or booked slot conflict check
const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;
    // const startDateTime = new Date(
    //     addMinutes(
    //         addHours(
    //             `${format(new Date(startDate), 'yyyy-MM-dd')}`,
    //             Number(startTime.split(':')[0])
    //         ),
    //         Number(startTime.split(':')[1])
    //     )
    // );

    // const endDateTime = new Date(
    //     addMinutes(
    //         addHours(
    //             `${format(new Date(endDate), 'yyyy-MM-dd')}`,
    //             Number(endTime.split(':')[0])
    //         ),
    //         Number(endTime.split(':')[1])
    //     )
    // );
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    const startDateTime = buildDateTime(currentDate, startTime);
    const endDateTime = buildDateTime(lastDate, endTime);

    const updatedSchedule = await prisma.schedule.update({
        where: {
            id: id
        },
        data: {
            startDateTime: startDateTime,
            endDateTime: endDateTime
        }
    });

    await redisService.deleteByPattern("schedules:list:*");

    return updatedSchedule;
}

const deleteSchedule = async (id: string) => {
    const schedule = await prisma.schedule.findUniqueOrThrow({
        where: { id },
        include: {
            doctorSchedules: true,
            appointments: true,
        }
    });

    if (schedule.doctorSchedules && schedule.doctorSchedules.length > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "Cannot delete a schedule that is already assigned to a doctor. Remove doctor schedule assignments first."
        );
    }

    if (schedule.appointments && schedule.appointments.length > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "Cannot delete a schedule that is associated with appointments."
        );
    }

    await prisma.schedule.delete({
        where: {
            id: id
        }
    });

    await redisService.deleteByPattern("schedules:list:*");

    return true;
}

export const ScheduleService = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
}