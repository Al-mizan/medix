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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IPrescription } from "@/types/prescription.types";
import { parsePrescriptionInstructions } from "@/zod/prescription.validation";
import { format } from "date-fns";
import {
    Calendar,
    FileDown,
    FileText,
    Mail,
    Phone,
    Pill,
    Stethoscope,
    User,
} from "lucide-react";

interface AdminViewPrescriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    prescription: IPrescription | null;
}

const getInitials = (name?: string) => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AdminViewPrescriptionDialog = ({
    open,
    onOpenChange,
    prescription,
}: AdminViewPrescriptionDialogProps) => {
    if (!prescription) return null;

    const patient = prescription.patient;
    const doctor = prescription.doctor;
    const appointment = prescription.appointment;

    const { medications, instructions } = parsePrescriptionInstructions(
        prescription.instructions || "",
    );

    const apptDate =
        appointment?.schedule?.startDateTime || appointment?.createdAt;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-foreground">
                                Prescription Details
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Ref ID: {prescription.id}
                            </DialogDescription>
                        </div>
                        {prescription.pdfUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                asChild
                            >
                                <a
                                    href={prescription.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Download PDF
                                </a>
                            </Button>
                        )}
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
                                    <span>Patient</span>
                                </div>
                                <div className="flex items-start gap-3 pt-1">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage
                                            src={patient?.profilePhoto || undefined}
                                            alt={patient?.name || "Patient"}
                                        />
                                        <AvatarFallback className="bg-muted text-xs font-semibold">
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
                                    <span>Prescribing Doctor</span>
                                </div>
                                <div className="flex items-start gap-3 pt-1">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage
                                            src={doctor?.profilePhoto || undefined}
                                            alt={doctor?.name || "Doctor"}
                                        />
                                        <AvatarFallback className="bg-muted text-xs font-semibold">
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
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Consultation & Follow-up Timeline */}
                        <div className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <Calendar className="h-4 w-4" />
                                <span>Timeline & Dates</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Appointment Date
                                    </span>
                                    <span className="font-medium text-foreground text-sm block">
                                        {apptDate
                                            ? format(new Date(apptDate), "MMM dd, yyyy")
                                            : "—"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Prescribed On
                                    </span>
                                    <span className="font-medium text-foreground text-sm block">
                                        {prescription.createdAt
                                            ? format(new Date(prescription.createdAt), "MMM dd, yyyy")
                                            : "—"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">
                                        Follow-up Consultation
                                    </span>
                                    <span className="font-medium text-foreground text-sm block">
                                        {prescription.followUpDate
                                            ? format(new Date(prescription.followUpDate), "MMM dd, yyyy")
                                            : "None specified"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Structured Medications Table */}
                        <div className="rounded-lg border space-y-3 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Pill className="h-4 w-4" />
                                    <span>Prescribed Medications ({medications.length})</span>
                                </div>
                            </div>

                            {medications.length > 0 ? (
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className="text-xs font-semibold">
                                                    Medicine
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Dosage
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Frequency
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold">
                                                    Duration
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {medications.map((med, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="text-xs font-medium text-foreground">
                                                        {med.name}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {med.dosage}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {med.frequency}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {med.duration}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic py-1">
                                    No structured medications listed.
                                </p>
                            )}
                        </div>

                        {/* Additional Instructions */}
                        <div className="rounded-lg border p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <FileText className="h-4 w-4" />
                                <span>Additional Instructions & Advice</span>
                            </div>
                            {instructions ? (
                                <p className="text-xs bg-muted/40 p-3 rounded-md border text-foreground whitespace-pre-line leading-relaxed">
                                    {instructions}
                                </p>
                            ) : prescription.instructions && medications.length === 0 ? (
                                <p className="text-xs bg-muted/40 p-3 rounded-md border text-foreground whitespace-pre-line leading-relaxed">
                                    {prescription.instructions}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground italic py-1">
                                    No additional instructions provided.
                                </p>
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

export default AdminViewPrescriptionDialog;
