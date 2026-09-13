"use client";

import DateCell from "@/components/shared/cell/DateCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IPrescription } from "@/types/prescription.types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, Eye, FileDown, MoreHorizontal } from "lucide-react";

interface PrescriptionColumnsOptions {
    onView?: (prescription: IPrescription) => void;
}

export const getPrescriptionsColumns = ({
    onView,
}: PrescriptionColumnsOptions = {}): ColumnDef<IPrescription>[] => [
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
                <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground">
                        {doctor?.name
                            ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                            : "Unknown Doctor"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                        {doctor?.designation || doctor?.email || "General Practitioner"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "appointmentDate",
        header: "Appointment Date",
        cell: ({ row }) => {
            const apptDate =
                row.original.appointment?.schedule?.startDateTime ||
                row.original.appointment?.createdAt;

            if (!apptDate) {
                return <span className="text-xs text-muted-foreground">—</span>;
            }

            return (
                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{format(new Date(apptDate), "MMM dd, yyyy")}</span>
                </div>
            );
        },
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Prescription Date",
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
        id: "followUpDate",
        accessorKey: "followUpDate",
        header: "Follow-up Date",
        cell: ({ row }) => {
            const followUp = row.original.followUpDate;
            if (!followUp) {
                return (
                    <span className="text-xs text-muted-foreground">None</span>
                );
            }
            return (
                <DateCell date={followUp} formatString="MMM dd, yyyy" />
            );
        },
    },
    {
        id: "pdfUrl",
        header: "PDF",
        enableSorting: false,
        cell: ({ row }) => {
            const pdfUrl = row.original.pdfUrl;
            if (!pdfUrl) {
                return (
                    <span className="text-xs text-muted-foreground italic">
                        No PDF
                    </span>
                );
            }

            return (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    asChild
                >
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FileDown className="h-3.5 w-3.5" />
                        Download PDF
                    </a>
                </Button>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
            const prescription = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                            onClick={() => onView?.(prescription)}
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

export const prescriptionsColumns: ColumnDef<IPrescription>[] =
    getPrescriptionsColumns();
