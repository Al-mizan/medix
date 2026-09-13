"use client";

import { changeAppointmentStatusAction } from "@/app/(dashboardLayout)/admin/dashboard/appointments-management/_action";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IAppointment } from "@/types/appointment.types";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CancelAppointmentConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: IAppointment | null;
}

const CancelAppointmentConfirmationDialog = ({
    open,
    onOpenChange,
    appointment,
}: CancelAppointmentConfirmationDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    if (!appointment) return null;

    const patientName = appointment.patient?.name || "Unknown Patient";
    const doctorName = appointment.doctor?.name
        ? `Dr. ${appointment.doctor.name.replace(/^Dr\.\s*/i, "")}`
        : "Unknown Doctor";

    const scheduleDate = appointment.schedule?.startDateTime
        ? format(new Date(appointment.schedule.startDateTime), "MMM dd, yyyy 'at' hh:mm a")
        : null;

    const handleConfirmCancel = async () => {
        setIsSubmitting(true);
        try {
            const res = await changeAppointmentStatusAction(
                appointment.id,
                "CANCELED",
            );

            if (res.success) {
                toast.success("Appointment canceled successfully");
                await queryClient.invalidateQueries({
                    queryKey: ["appointments"],
                });
                onOpenChange(false);
            } else {
                toast.error(res.message || "Failed to cancel appointment");
            }
        } catch {
            toast.error("An unexpected error occurred while canceling appointment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-6">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-lg font-semibold text-foreground">
                            Cancel Appointment
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground pt-1">
                        Are you sure you want to cancel this scheduled consultation? This will mark the appointment as CANCELED.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2 text-xs my-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Patient:</span>
                        <span className="font-medium text-foreground">{patientName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Doctor:</span>
                        <span className="font-medium text-foreground">{doctorName}</span>
                    </div>
                    {scheduleDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Schedule:</span>
                            <span className="font-medium text-foreground">{scheduleDate}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Appointment ID:</span>
                        <span className="font-mono text-foreground text-[11px] truncate max-w-[200px]">
                            {appointment.id}
                        </span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                        >
                            Keep Appointment
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirmCancel}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Canceling...
                            </>
                        ) : (
                            "Confirm Cancellation"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CancelAppointmentConfirmationDialog;
