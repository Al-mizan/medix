"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { IPayment } from "@/types/payment.types";
import { format } from "date-fns";
import {
    Calendar,
    Check,
    Clock,
    Copy,
    CreditCard,
    DollarSign,
    ExternalLink,
    FileText,
    Mail,
    Stethoscope,
    Tag,
    User,
} from "lucide-react";
import { useState } from "react";
import { PaymentStatusBadge } from "./paymentBadges";

interface ViewPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: IPayment | null;
}

const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const ViewPaymentDialog = ({
    open,
    onOpenChange,
    payment,
}: ViewPaymentDialogProps) => {
    const [copied, setCopied] = useState(false);

    if (!payment) return null;

    const patient = payment.patient || payment.appointment?.patient;
    const doctor = payment.doctor || payment.appointment?.doctor;
    const schedule = payment.schedule || payment.appointment?.schedule;

    const handleCopyTransactionId = () => {
        if (payment.transactionId) {
            navigator.clipboard.writeText(payment.transactionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formattedAmount =
        typeof payment.amount === "number"
            ? `$${payment.amount.toFixed(2)}`
            : `$${payment.amount}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-foreground">
                                Payment Details
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-1">
                                Complete transaction, stripe metadata, and invoice records
                            </DialogDescription>
                        </div>
                        <PaymentStatusBadge status={payment.status} />
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Transaction Summary Card */}
                        <div className="rounded-lg border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Transaction Summary
                                </h3>
                                <div className="text-2xl font-bold text-foreground">
                                    {formattedAmount}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground">Transaction ID</span>
                                    <div className="flex items-center gap-1.5 font-mono text-foreground font-medium bg-muted/50 px-2 py-1 rounded border">
                                        <span className="truncate" title={payment.transactionId}>
                                            {payment.transactionId}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyTransactionId}
                                            className="text-muted-foreground hover:text-foreground shrink-0"
                                            title="Copy Transaction ID"
                                        >
                                            {copied ? (
                                                <Check className="h-3.5 w-3.5 text-[#178A5E]" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-muted-foreground">Stripe Event ID</span>
                                    <div className="font-mono text-foreground font-medium bg-muted/50 px-2 py-1 rounded border truncate" title={payment.stripeEventId || "N/A"}>
                                        {payment.stripeEventId || "None recorded"}
                                    </div>
                                </div>
                            </div>

                            {payment.invoiceUrl && (
                                <div className="pt-2 border-t flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        Official Cloudinary Invoice
                                    </span>
                                    <a
                                        href={payment.invoiceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Download PDF Invoice
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Patient & Doctor Two-Column Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Patient Info */}
                            <div className="rounded-lg border bg-card p-4 space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" />
                                    Patient Information
                                </h3>
                                <div className="flex items-center gap-3 pt-1">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage
                                            src={patient?.profilePhoto || undefined}
                                            alt={patient?.name || "Patient"}
                                        />
                                        <AvatarFallback className="text-xs bg-muted">
                                            {getInitials(patient?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {patient?.name || "Unknown Patient"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {patient?.email || "No email"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Doctor Info */}
                            <div className="rounded-lg border bg-card p-4 space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Stethoscope className="h-3.5 w-3.5" />
                                    Doctor Information
                                </h3>
                                <div className="flex items-center gap-3 pt-1">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage
                                            src={doctor?.profilePhoto || undefined}
                                            alt={doctor?.name || "Doctor"}
                                        />
                                        <AvatarFallback className="text-xs bg-muted">
                                            {getInitials(doctor?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {doctor?.name
                                                ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                                                : "Unknown Doctor"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {doctor?.designation || doctor?.email || "General Practitioner"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Associated Appointment Details */}
                        <div className="rounded-lg border bg-card p-4 space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Associated Appointment
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                <div>
                                    <span className="text-muted-foreground block">Appointment ID</span>
                                    <span className="font-mono text-foreground font-medium">
                                        {payment.appointmentId}
                                    </span>
                                </div>
                                {schedule?.startDateTime && (
                                    <div>
                                        <span className="text-muted-foreground block">Scheduled Date</span>
                                        <span className="font-medium text-foreground">
                                            {format(new Date(schedule.startDateTime), "PPP 'at' hh:mm a")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Audit Timestamps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                            <div>
                                <span className="block font-medium">Payment ID:</span>
                                <span className="font-mono truncate block" title={payment.id}>
                                    {payment.id}
                                </span>
                            </div>
                            <div>
                                <span className="block font-medium">Recorded Date:</span>
                                <span>
                                    {payment.createdAt
                                        ? format(new Date(payment.createdAt), "PPP 'at' pp")
                                        : "—"}
                                </span>
                            </div>
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

export default ViewPaymentDialog;
