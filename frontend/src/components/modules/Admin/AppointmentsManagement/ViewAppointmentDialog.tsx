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
import { IAppointment } from "@/types/appointment.types";
import { format } from "date-fns";
import {
    Calendar,
    Clock,
    CreditCard,
    ExternalLink,
    FileDown,
    FileText,
    Mail,
    Phone,
    Stethoscope,
    User,
    Video,
} from "lucide-react";
import {
    AppointmentStatusBadge,
    PaymentStatusBadge,
} from "./appointmentBadges";

interface ViewAppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: IAppointment | null;
}

const getInitials = (name?: string) => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ViewAppointmentDialog = ({
    open,
    onOpenChange,
    appointment,
}: ViewAppointmentDialogProps) => {
    if (!appointment) return null;

    const patient = appointment.patient;
    const doctor = appointment.doctor;
    const schedule = appointment.schedule;
    const payment = appointment.payment;
    const prescription = appointment.prescription;

    const startDate = schedule?.startDateTime
        ? new Date(schedule.startDateTime)
        : null;
    const endDate = schedule?.endDateTime ? new Date(schedule.endDateTime) : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-foreground">
                                Appointment Details
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Ref ID: {appointment.id}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <AppointmentStatusBadge status={appointment.status} />
                            <PaymentStatusBadge status={appointment.paymentStatus} />
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-6">
                        {/* Two-Column Overview: Patient & Doctor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Patient Section */}
                            <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <User className="h-4 w-4" />
                                    <span>Patient Information</span>
                                </div>
                                <div className="flex items-start gap-3 pt-1">
                                    <Avatar className="h-11 w-11 border">
                                        <AvatarImage
                                            src={patient?.profilePhoto || undefined}
                                            alt={patient?.name || "Patient"}
                                        />
                                        <AvatarFallback className="bg-muted text-sm font-semibold">
                                            {getInitials(patient?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {patient?.name || "Unknown Patient"}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                                {patient?.email || "No email"}
                                            </span>
                                        </div>
                                        {patient?.contactNumber && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Phone className="h-3 w-3 shrink-0" />
                                                <span>{patient.contactNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Doctor Section */}
                            <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Stethoscope className="h-4 w-4" />
                                    <span>Doctor Information</span>
                                </div>
                                <div className="flex items-start gap-3 pt-1">
                                    <Avatar className="h-11 w-11 border">
                                        <AvatarImage
                                            src={doctor?.profilePhoto || undefined}
                                            alt={doctor?.name || "Doctor"}
                                        />
                                        <AvatarFallback className="bg-muted text-sm font-semibold">
                                            {getInitials(doctor?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {doctor?.name
                                                ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                                                : "Unknown Doctor"}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                                {doctor?.email || "No email"}
                                            </span>
                                        </div>
                                        {doctor?.designation && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {doctor.designation}
                                                {doctor.currentWorkingPlace &&
                                                    ` • ${doctor.currentWorkingPlace}`}
                                            </p>
                                        )}
                                        {doctor?.specialties && doctor.specialties.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {doctor.specialties.map((item, idx) => (
                                                    <Badge
                                                        key={item.specialty?.id || idx}
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 py-0"
                                                    >
                                                        {item.specialty?.title}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Consultation Info */}
                        <div className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <Calendar className="h-4 w-4" />
                                <span>Consultation Schedule</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Appointment Date
                                    </span>
                                    <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {startDate
                                                ? format(startDate, "MMMM dd, yyyy")
                                                : "Not set"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Time Slot
                                    </span>
                                    <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {startDate
                                                ? `${format(startDate, "hh:mm a")} ${
                                                      endDate
                                                          ? `- ${format(endDate, "hh:mm a")}`
                                                          : ""
                                                  }`
                                                : "Not set"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Video Room ID
                                    </span>
                                    <div className="flex items-center gap-1.5 font-mono text-xs text-foreground bg-muted/50 px-2 py-1 rounded">
                                        <Video className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="truncate">
                                            {appointment.videoCallingId || "Pending generation"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Payment Details</span>
                                </div>
                                <PaymentStatusBadge status={appointment.paymentStatus} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Fee Amount
                                    </span>
                                    <span className="text-base font-semibold text-foreground">
                                        ${payment?.amount ?? doctor?.appointmentFee ?? 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Transaction ID
                                    </span>
                                    <span className="font-mono text-xs text-foreground truncate block">
                                        {payment?.transactionId || "—"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Invoice
                                    </span>
                                    {payment?.invoiceUrl ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs gap-1"
                                            asChild
                                        >
                                            <a
                                                href={payment.invoiceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View Invoice
                                            </a>
                                        </Button>
                                    ) : (
                                        <span className="text-muted-foreground italic">
                                            No invoice available
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Prescription Information */}
                        <div className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <FileText className="h-4 w-4" />
                                    <span>Prescription Record</span>
                                </div>
                                {prescription?.pdfUrl && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs gap-1.5"
                                        asChild
                                    >
                                        <a
                                            href={prescription.pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FileDown className="h-3.5 w-3.5" />
                                            Download PDF
                                        </a>
                                    </Button>
                                )}
                            </div>

                            {prescription ? (
                                <div className="space-y-2 text-xs pt-1">
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-muted-foreground">
                                            Prescription ID:
                                        </span>
                                        <span className="font-mono text-foreground">
                                            {prescription.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-muted-foreground">
                                            Follow-up Date:
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {prescription.followUpDate
                                                ? format(
                                                      new Date(prescription.followUpDate),
                                                      "MMM dd, yyyy",
                                                  )
                                                : "None specified"}
                                        </span>
                                    </div>
                                    {prescription.instructions && (
                                        <div className="pt-2">
                                            <span className="text-muted-foreground block mb-1">
                                                Clinical Instructions:
                                            </span>
                                            <p className="text-xs bg-muted/40 p-2.5 rounded border whitespace-pre-line text-foreground">
                                                {prescription.instructions}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic py-1">
                                    No prescription has been issued for this appointment yet.
                                </p>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                            <span>
                                Created:{" "}
                                {appointment.createdAt
                                    ? format(
                                          new Date(appointment.createdAt),
                                          "MMM dd, yyyy hh:mm a",
                                      )
                                    : "—"}
                            </span>
                            {appointment.updatedAt && (
                                <span>
                                    Last Updated:{" "}
                                    {format(
                                        new Date(appointment.updatedAt),
                                        "MMM dd, yyyy hh:mm a",
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t flex justify-end">
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewAppointmentDialog;
