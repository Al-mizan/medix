"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FilePlus,
  Loader2,
  MoreHorizontal,
  Play,
  User,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentStatus, IAppointment } from "@/types/appointment.types";

const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case "SCHEDULED":
      return "border-[#0B7285]/30 bg-[#0B7285]/10 text-[#0B7285] dark:bg-[#0B7285]/20";
    case "INPROGRESS":
      return "border-[#E3A130]/30 bg-[#E3A130]/10 text-[#7A4A09] dark:text-[#E3A130] dark:bg-[#E3A130]/20";
    case "COMPLETED":
      return "border-[#178A5E]/30 bg-[#178A5E]/10 text-[#178A5E] dark:bg-[#178A5E]/20";
    case "CANCELED":
      return "border-[#D8464B]/30 bg-[#D8464B]/10 text-[#D8464B] dark:bg-[#D8464B]/20";
    default:
      return "border-muted bg-muted/40 text-muted-foreground";
  }
};

const getPaymentBadgeClass = (status?: string) => {
  switch (status) {
    case "PAID":
      return "border-[#178A5E]/30 bg-[#178A5E]/10 text-[#178A5E] dark:bg-[#178A5E]/20";
    case "UNPAID":
      return "border-neutral-300 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";
    case "FAILED":
      return "border-[#D8464B]/30 bg-[#D8464B]/10 text-[#D8464B] dark:bg-[#D8464B]/20";
    default:
      return "border-muted bg-muted/40 text-muted-foreground";
  }
};

const getInitials = (name?: string) => {
  if (!name) return "PT";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface GetDoctorAppointmentsColumnsOptions {
  pendingAppointmentId: string | null;
  onStatusTransition: (appointment: IAppointment, status: AppointmentStatus) => void;
  onViewDetails: (appointment: IAppointment) => void;
}

export const getDoctorAppointmentsColumns = ({
  pendingAppointmentId,
  onStatusTransition,
  onViewDetails,
}: GetDoctorAppointmentsColumnsOptions): ColumnDef<IAppointment>[] => [
  {
    id: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const patient = row.original.patient;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-neutral-200 dark:border-neutral-700">
            {patient?.profilePhoto && (
              <AvatarImage src={patient.profilePhoto} alt={patient?.name ?? "Patient"} />
            )}
            <AvatarFallback className="bg-[#0B7285]/10 text-xs font-semibold text-[#0B7285]">
              {getInitials(patient?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{patient?.name ?? "Unknown Patient"}</p>
            <p className="text-xs text-muted-foreground">{patient?.email ?? "No email provided"}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: "schedule",
    header: "Date & Time",
    cell: ({ row }) => {
      const schedule = row.original.schedule;
      if (!schedule?.startDateTime) {
        return <span className="text-xs text-muted-foreground">Not scheduled</span>;
      }

      const startDate = new Date(schedule.startDateTime);
      const endDate = schedule.endDateTime ? new Date(schedule.endDateTime) : null;

      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Calendar className="size-3.5 text-[#0B7285]" />
            {format(startDate, "MMM dd, yyyy")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3 text-muted-foreground" />
            {format(startDate, "hh:mm a")}
            {endDate && ` - ${format(endDate, "hh:mm a")}`}
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
      const status = row.original.status ?? "SCHEDULED";
      return (
        <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(status)}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "paymentStatus",
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus ?? "UNPAID";
      return (
        <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-xs font-medium ${getPaymentBadgeClass(paymentStatus)}`}>
          {paymentStatus}
        </Badge>
      );
    },
  },
  {
    id: "consultation",
    header: "Video Call",
    cell: ({ row }) => {
      const appointment = row.original;
      const isEligible = appointment.status === "SCHEDULED" || appointment.status === "INPROGRESS";

      if (!isEligible || !appointment.videoCallingId) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }

      return (
        <Button
          asChild
          size="sm"
          variant="outline"
          className={
            appointment.status === "INPROGRESS"
              ? "h-8 border-[#0B7285] bg-[#0B7285]/10 text-xs text-[#0B7285] hover:bg-[#0B7285]/20 font-semibold animate-pulse"
              : "h-8 border-[#0B7285]/30 text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
          }
        >
          <Link href={`/consultation/session/${appointment.videoCallingId}`}>
            <Video className="mr-1.5 size-3.5" />
            {appointment.status === "INPROGRESS" ? "Join Room" : "Pre-Call Setup"}
          </Link>
        </Button>
      );
    },
  },
  {
    id: "actions",
    header: "Status Action",
    cell: ({ row }) => {
      const appointment = row.original;
      const isPending = pendingAppointmentId === appointment.id;
      const status = appointment.status;

      return (
        <div className="flex items-center gap-2">
          {status === "SCHEDULED" && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => onStatusTransition(appointment, "INPROGRESS")}
              className="h-8 bg-[#0B7285] px-3 text-xs text-white hover:bg-[#095E70]"
            >
              {isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Play className="mr-1.5 size-3.5" />}
              Start Consultation
            </Button>
          )}

          {status === "INPROGRESS" && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => onStatusTransition(appointment, "COMPLETED")}
              className="h-8 bg-[#178A5E] px-3 text-xs text-white hover:bg-[#0F6E4A]"
            >
              {isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 size-3.5" />}
              Complete Consultation
            </Button>
          )}

          {status === "COMPLETED" && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 border-[#0B7285]/30 text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
            >
              <Link href={`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`}>
                <FilePlus className="mr-1.5 size-3.5" />
                Prescription
              </Link>
            </Button>
          )}

          {status === "CANCELED" && (
            <span className="text-xs text-muted-foreground italic">Canceled</span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Options</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(appointment)} className="text-xs cursor-pointer">
                <User className="mr-2 size-3.5 text-[#0B7285]" />
                View Details
              </DropdownMenuItem>
              {status === "COMPLETED" && (
                <DropdownMenuItem asChild className="text-xs cursor-pointer">
                  <Link href={`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`}>
                    <FilePlus className="mr-2 size-3.5 text-[#0B7285]" />
                    Issue Prescription
                  </Link>
                </DropdownMenuItem>
              )}
              {(status === "SCHEDULED" || status === "INPROGRESS") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-xs cursor-pointer">
                    <Link href={`/consultation/doctor/${appointment.id}`}>
                      <Video className="mr-2 size-3.5 text-[#0B7285]" />
                      Enter Video Room
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
