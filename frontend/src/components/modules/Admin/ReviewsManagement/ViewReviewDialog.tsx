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
import { IReview } from "@/types/review.types";
import { format } from "date-fns";
import {
    Calendar,
    FileText,
    Mail,
    MessageSquare,
    Phone,
    Star,
    Stethoscope,
    User,
} from "lucide-react";

interface ViewReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review: IReview | null;
}

const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ViewReviewDialog = ({
    open,
    onOpenChange,
    review,
}: ViewReviewDialogProps) => {
    if (!review) return null;

    const patient = review.patient;
    const doctor = review.doctor;
    const appointment = review.appointment;
    const rating = Number(review.rating) || 0;

    const apptDate =
        appointment?.schedule?.startDateTime || appointment?.createdAt;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-foreground">
                                Patient Review
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Ref ID: {review.id}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 rounded-md">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                {rating.toFixed(1)} / 5.0
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-5">
                        {/* Rating Stars Header */}
                        <div className="rounded-lg border p-4 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${
                                                star <= Math.round(rating)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "fill-muted text-muted stroke-muted-foreground/40"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    {rating >= 4.5
                                        ? "Excellent"
                                        : rating >= 3.5
                                          ? "Good"
                                          : rating >= 2.5
                                            ? "Average"
                                            : "Poor"}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                    {review.createdAt
                                        ? format(
                                              new Date(review.createdAt),
                                              "MMMM dd, yyyy 'at' hh:mm a",
                                          )
                                        : "—"}
                                </span>
                            </div>
                        </div>

                        {/* Full Comment */}
                        <div className="rounded-lg border p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <MessageSquare className="h-4 w-4" />
                                <span>Patient Feedback</span>
                            </div>
                            {review.comment ? (
                                <p className="text-sm text-foreground bg-muted/40 p-3.5 rounded-md border whitespace-pre-line leading-relaxed">
                                    &ldquo;{review.comment}&rdquo;
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground italic py-1">
                                    No written comment was submitted with this rating.
                                </p>
                            )}
                        </div>

                        {/* Patient & Doctor Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Patient */}
                            <div className="rounded-lg border p-3.5 bg-muted/10 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <User className="h-3.5 w-3.5" />
                                    <span>Reviewer</span>
                                </div>
                                <div className="flex items-start gap-3 pt-1">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage
                                            src={patient?.profilePhoto || undefined}
                                            alt={patient?.name || "Patient"}
                                        />
                                        <AvatarFallback className="bg-muted text-xs font-semibold">
                                            {getInitials(patient?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {patient?.name || "Unknown Patient"}
                                        </p>
                                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                                {patient?.email || "No email"}
                                            </span>
                                        </div>
                                        {patient?.contactNumber && (
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                <Phone className="h-3 w-3 shrink-0" />
                                                <span>{patient.contactNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Doctor */}
                            <div className="rounded-lg border p-3.5 bg-muted/10 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Stethoscope className="h-3.5 w-3.5" />
                                    <span>Reviewed Doctor</span>
                                </div>
                                <div className="flex items-start gap-3 pt-1">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage
                                            src={doctor?.profilePhoto || undefined}
                                            alt={doctor?.name || "Doctor"}
                                        />
                                        <AvatarFallback className="bg-muted text-xs font-semibold">
                                            {getInitials(doctor?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {doctor?.name
                                                ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                                                : "Unknown Doctor"}
                                        </p>
                                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                                {doctor?.email || "No email"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Associated Appointment Details */}
                        <div className="rounded-lg border p-3.5 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <FileText className="h-3.5 w-3.5" />
                                <span>Appointment Context</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <div className="flex justify-between py-1 border-b">
                                    <span className="text-muted-foreground">
                                        Appointment ID:
                                    </span>
                                    <span className="font-mono text-foreground text-[11px] truncate max-w-[160px]">
                                        {review.appointmentId || "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b">
                                    <span className="text-muted-foreground">
                                        Consultation Date:
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {apptDate
                                            ? format(new Date(apptDate), "MMM dd, yyyy")
                                            : "—"}
                                    </span>
                                </div>
                            </div>
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

export default ViewReviewDialog;
