"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IDoctorSchedule } from "@/types/doctorSchedule.types";
import { differenceInMinutes, format } from "date-fns";
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    GraduationCap,
    Mail,
    Stethoscope,
    User,
    XCircle,
} from "lucide-react";

interface ViewDoctorScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctorSchedule: IDoctorSchedule | null;
}

const getInitials = (name?: string) => {
    if (!name) return "DR";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ViewDoctorScheduleDialog = ({
    open,
    onOpenChange,
    doctorSchedule,
}: ViewDoctorScheduleDialogProps) => {
    if (!doctorSchedule) return null;

    const doctor = doctorSchedule.doctor;
    const schedule = doctorSchedule.schedule;
    const startDate = schedule?.startDateTime
        ? new Date(schedule.startDateTime)
        : null;
    const endDate = schedule?.endDateTime ? new Date(schedule.endDateTime) : null;
    const durationMinutes =
        startDate && endDate ? differenceInMinutes(endDate, startDate) : null;

    const matchedAppointment = doctor?.appointments?.find(
        (a) =>
            a.scheduleId === doctorSchedule.scheduleId &&
            a.status !== "CANCELED",
    );
    const appointmentId = doctorSchedule.appointmentId || matchedAppointment?.id;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-foreground">
                                Doctor Schedule Details
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-1">
                                Assignment and slot details for Doctor and Schedule
                            </DialogDescription>
                        </div>
                        {doctorSchedule.isBooked ? (
                            <Badge
                                variant="outline"
                                className="font-medium text-xs px-2.5 py-0.5 rounded-full border-[#178A5E]/30 bg-[#E3F7EE] text-[#0F5C3E] dark:bg-[#178A5E]/20 dark:text-[#E3F7EE] inline-flex items-center gap-1"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Booked
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="font-medium text-xs px-2.5 py-0.5 rounded-full border-muted bg-muted/40 text-muted-foreground inline-flex items-center gap-1"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Available
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Doctor Information Card */}
                        <div className="rounded-lg border bg-card p-4 space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                Doctor Information
                            </h3>
                            <div className="flex items-start gap-4 pt-1">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage
                                        src={doctor?.profilePhoto || undefined}
                                        alt={doctor?.name || "Doctor"}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                        {getInitials(doctor?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 flex-1">
                                    <h4 className="text-base font-semibold text-foreground leading-none">
                                        {doctor?.name
                                            ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                                            : "Doctor Name Not Provided"}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span>{doctor?.email || doctor?.user?.email || "No email"}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                                        {doctor?.designation && (
                                            <span className="flex items-center gap-1">
                                                <Stethoscope className="h-3 w-3" />
                                                {doctor.designation}
                                            </span>
                                        )}
                                        {doctor?.qualification && (
                                            <span className="flex items-center gap-1">
                                                <GraduationCap className="h-3 w-3" />
                                                {doctor.qualification}
                                            </span>
                                        )}
                                        {doctor?.currentWorkingPlace && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3 w-3" />
                                                {doctor.currentWorkingPlace}
                                            </span>
                                        )}
                                    </div>
                                    {doctor?.appointmentFee !== undefined && (
                                        <div className="pt-1 flex items-center gap-1 text-xs font-medium text-foreground">
                                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>Fee: ${doctor.appointmentFee}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Schedule Timing Information */}
                        <div className="rounded-lg border bg-card p-4 space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Schedule Time Slot
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground">Start Time</span>
                                    <div className="font-medium text-foreground flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        {startDate ? format(startDate, "PPP 'at' hh:mm a") : "—"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground">End Time</span>
                                    <div className="font-medium text-foreground flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        {endDate ? format(endDate, "PPP 'at' hh:mm a") : "—"}
                                    </div>
                                </div>
                                {durationMinutes !== null && (
                                    <div className="space-y-1 col-span-full">
                                        <span className="text-muted-foreground">Slot Duration</span>
                                        <div className="font-medium text-foreground">
                                            {durationMinutes} minutes
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking & Associated Appointment */}
                        {doctorSchedule.isBooked && (
                            <div className="rounded-lg border bg-card p-4 space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#178A5E]" />
                                    Booked Appointment Details
                                </h3>
                                <div className="space-y-2 pt-1 text-xs">
                                    {appointmentId && (
                                        <div className="flex items-center justify-between py-1 border-b">
                                            <span className="text-muted-foreground">Appointment ID</span>
                                            <span className="font-mono text-foreground font-medium">
                                                {appointmentId}
                                            </span>
                                        </div>
                                    )}
                                    {matchedAppointment?.patient && (
                                        <div className="flex items-center justify-between py-1 border-b">
                                            <span className="text-muted-foreground">Patient</span>
                                            <span className="font-medium text-foreground">
                                                {matchedAppointment.patient.name} ({matchedAppointment.patient.email})
                                            </span>
                                        </div>
                                    )}
                                    {matchedAppointment?.status && (
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-muted-foreground">Appointment Status</span>
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {matchedAppointment.status}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Metadata IDs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                            <div>
                                <span className="block font-medium">Doctor ID:</span>
                                <span className="font-mono truncate block" title={doctorSchedule.doctorId}>
                                    {doctorSchedule.doctorId}
                                </span>
                            </div>
                            <div>
                                <span className="block font-medium">Schedule ID:</span>
                                <span className="font-mono truncate block" title={doctorSchedule.scheduleId}>
                                    {doctorSchedule.scheduleId}
                                </span>
                            </div>
                            {doctorSchedule.createdAt && (
                                <div>
                                    <span className="block font-medium">Assigned At:</span>
                                    <span>{format(new Date(doctorSchedule.createdAt), "PPP 'at' pp")}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/20 flex justify-end">
                    <DialogClose asChild>
                        <Button variant="outline" size="sm">
                            Close
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewDoctorScheduleDialog;
