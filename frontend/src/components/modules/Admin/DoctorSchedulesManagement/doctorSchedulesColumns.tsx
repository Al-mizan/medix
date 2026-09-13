"use client";

import DateCell from "@/components/shared/cell/DateCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, CheckCircle2, Clock, Eye, MoreHorizontal, XCircle } from "lucide-react";

interface DoctorSchedulesColumnsOptions {
    onView?: (schedule: IDoctorSchedule) => void;
}

export const getDoctorSchedulesColumns = ({
    onView,
}: DoctorSchedulesColumnsOptions = {}): ColumnDef<IDoctorSchedule>[] => [
    {
        id: "doctor",
        accessorKey: "doctor.name",
        header: "Doctor",
        cell: ({ row }) => {
            const doctor = row.original.doctor;
            const name = doctor?.name
                ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                : "Unknown Doctor";
            const email = doctor?.email || doctor?.user?.email || "No email";

            return (
                <UserInfoCell
                    name={name}
                    email={email}
                    profilePhoto={doctor?.profilePhoto || undefined}
                />
            );
        },
    },
    {
        id: "scheduleTime",
        header: "Schedule Date & Time",
        cell: ({ row }) => {
            const schedule = row.original.schedule;
            if (!schedule?.startDateTime) {
                return <span className="text-xs text-muted-foreground">—</span>;
            }

            const startDate = new Date(schedule.startDateTime);
            const endDate = schedule.endDateTime
                ? new Date(schedule.endDateTime)
                : null;

            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{format(startDate, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                            {format(startDate, "hh:mm a")}
                            {endDate && ` - ${format(endDate, "hh:mm a")}`}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        id: "isBooked",
        accessorKey: "isBooked",
        header: "Booking Status",
        cell: ({ row }) => {
            const isBooked = row.original.isBooked;
            if (isBooked) {
                return (
                    <Badge
                        variant="outline"
                        className="font-medium text-xs px-2.5 py-0.5 rounded-full border-[#178A5E]/30 bg-[#E3F7EE] text-[#0F5C3E] dark:bg-[#178A5E]/20 dark:text-[#E3F7EE] inline-flex items-center gap-1"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Booked
                    </Badge>
                );
            }
            return (
                <Badge
                    variant="outline"
                    className="font-medium text-xs px-2.5 py-0.5 rounded-full border-muted bg-muted/40 text-muted-foreground inline-flex items-center gap-1"
                >
                    <XCircle className="h-3 w-3" />
                    Available
                </Badge>
            );
        },
    },
    {
        id: "appointmentId",
        header: "Appointment ID",
        enableSorting: false,
        cell: ({ row }) => {
            const { appointmentId, doctor, scheduleId, isBooked } = row.original;
            const matchedAppointment = doctor?.appointments?.find(
                (a) => a.scheduleId === scheduleId && a.status !== "CANCELED",
            );
            const apptId = appointmentId || matchedAppointment?.id;

            if (isBooked && apptId) {
                return (
                    <span
                        className="font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border/50 max-w-[140px] truncate block"
                        title={apptId}
                    >
                        {apptId.slice(0, 8)}...
                    </span>
                );
            }

            return <span className="text-xs text-muted-foreground">—</span>;
        },
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => {
            return (
                <DateCell
                    date={row.original.createdAt}
                    formatString="MMM dd, yyyy"
                />
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
            const doctorSchedule = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                            onClick={() => onView?.(doctorSchedule)}
                            className="cursor-pointer"
                        >
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            View Details
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const doctorSchedulesColumns: ColumnDef<IDoctorSchedule>[] =
    getDoctorSchedulesColumns();
