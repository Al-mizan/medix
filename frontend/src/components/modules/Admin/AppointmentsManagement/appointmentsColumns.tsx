"use client";

import DateCell from "@/components/shared/cell/DateCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IAppointment } from "@/types/appointment.types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ban, Calendar, Clock, Eye, MoreHorizontal } from "lucide-react";
import {
    AppointmentStatusBadge,
    PaymentStatusBadge,
} from "./appointmentBadges";

interface AppointmentColumnsOptions {
    onView?: (appointment: IAppointment) => void;
    onCancel?: (appointment: IAppointment) => void;
}

export const getAppointmentsColumns = ({
    onView,
    onCancel,
}: AppointmentColumnsOptions = {}): ColumnDef<IAppointment>[] => [
    {
        id: "patient",
        accessorKey: "patient.name",
        header: "Patient",
        cell: ({ row }) => {
            const patient = row.original.patient;
            return (
                <UserInfoCell
                    name={patient?.name || "Unknown Patient"}
                    email={patient?.email || "No email"}
                    profilePhoto={patient?.profilePhoto || undefined}
                />
            );
        },
    },
    {
        id: "doctor",
        accessorKey: "doctor.name",
        header: "Doctor",
        cell: ({ row }) => {
            const doctor = row.original.doctor;
            return (
                <UserInfoCell
                    name={doctor?.name ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}` : "Unknown Doctor"}
                    email={doctor?.email || "No email"}
                    profilePhoto={doctor?.profilePhoto || undefined}
                />
            );
        },
    },
    {
        id: "specialty",
        header: "Specialty",
        enableSorting: false,
        cell: ({ row }) => {
            const doctor = row.original.doctor;
            const specialties = doctor?.specialties;
            const firstSpecialty = specialties?.[0]?.specialty?.title;

            if (firstSpecialty) {
                return (
                    <Badge variant="secondary" className="font-normal text-xs">
                        {firstSpecialty}
                    </Badge>
                );
            }

            if (doctor?.designation) {
                return (
                    <Badge variant="outline" className="font-normal text-xs">
                        {doctor.designation}
                    </Badge>
                );
            }

            return (
                <span className="text-xs text-muted-foreground">General</span>
            );
        },
    },
    {
        id: "schedule",
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
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return <AppointmentStatusBadge status={row.original.status} />;
        },
    },
    {
        id: "paymentStatus",
        accessorKey: "paymentStatus",
        header: "Payment",
        cell: ({ row }) => {
            return <PaymentStatusBadge status={row.original.paymentStatus} />;
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
            const appointment = row.original;
            const canCancel =
                appointment.status !== "CANCELED" &&
                appointment.status !== "COMPLETED";

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
                            onClick={() => onView?.(appointment)}
                            className="cursor-pointer"
                        >
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            View Details
                        </DropdownMenuItem>

                        {canCancel && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onCancel?.(appointment)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                    <Ban className="mr-2 h-4 w-4 text-destructive" />
                                    Cancel Appointment
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const appointmentsColumns: ColumnDef<IAppointment>[] =
    getAppointmentsColumns();
