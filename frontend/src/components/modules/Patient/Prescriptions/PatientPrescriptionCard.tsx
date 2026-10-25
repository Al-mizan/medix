"use client";

import { useState } from "react";
import { IPrescription } from "@/types/prescription.types";
import { parsePrescriptionInstructions } from "@/zod/prescription.validation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    FileDown,
    Eye,
    Pill,
    Stethoscope,
} from "lucide-react";
import { format } from "date-fns";
import PatientPrescriptionDetailsDialog from "./PatientPrescriptionDetailsDialog";

interface PatientPrescriptionCardProps {
    prescription: IPrescription;
}

const getInitials = (name?: string) => {
    if (!name) return "DR";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDateSafe = (dateVal?: string | Date | null, formatStr = "MMM d, yyyy") => {
    if (!dateVal) return "N/A";
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "N/A";
        return format(d, formatStr);
    } catch {
        return "N/A";
    }
};

export default function PatientPrescriptionCard({
    prescription,
}: PatientPrescriptionCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const { medications, instructions } = parsePrescriptionInstructions(
        prescription.instructions || ""
    );

    const doctorName = prescription.doctor?.name || "Attending Physician";
    const doctorDesignation = prescription.doctor?.designation || "Medical Specialist";
    const appointmentDate = prescription.appointment?.schedule?.startDateTime || prescription.createdAt;

    return (
        <>
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card text-card-foreground p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md">
                <div className="space-y-4">
                    {/* Header: Doctor Info & Follow-up badge */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-11 w-11 border border-border shrink-0">
                                <AvatarImage
                                    src={prescription.doctor?.profilePhoto || undefined}
                                    alt={doctorName}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                    {getInitials(doctorName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5 min-w-0 flex-1">
                                <h3 className="text-sm font-bold text-foreground truncate" title={doctorName}>
                                    {doctorName}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate" title={doctorDesignation}>
                                    {doctorDesignation}
                                </p>
                            </div>
                        </div>

                        {prescription.followUpDate && formatDateSafe(prescription.followUpDate, "MMM d") !== "N/A" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary shrink-0">
                                <Stethoscope className="h-3 w-3 text-primary" />
                                Next: {formatDateSafe(prescription.followUpDate, "MMM d")}
                            </span>
                        )}
                    </div>

                    {/* Dates strip */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-muted/30 px-3.5 py-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" />
                            <strong className="text-foreground">Consultation:</strong>{" "}
                            {formatDateSafe(appointmentDate, "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" />
                            <strong className="text-foreground">Prescribed:</strong>{" "}
                            {formatDateSafe(prescription.createdAt, "MMM d, yyyy")}
                        </span>
                    </div>

                    {/* Medications Preview */}
                    <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Pill className="h-3 w-3 text-primary" />
                            Prescribed Medications ({medications.length})
                        </span>
                        {medications.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {medications.slice(0, 3).map((med, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center rounded-md bg-muted/40 border border-border px-2 py-0.5 text-xs font-medium text-foreground max-w-[160px] truncate"
                                        title={med.name}
                                    >
                                        <span className="truncate">{med.name}</span>
                                        {med.dosage && (
                                            <span className="ml-1 text-[10px] text-muted-foreground shrink-0">
                                                ({med.dosage})
                                            </span>
                                        )}
                                    </span>
                                ))}
                                {medications.length > 3 && (
                                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
                                        +{medications.length - 3} more
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic line-clamp-2">
                                {instructions || "Clinical instructions provided."}
                            </p>
                        )}
                    </div>

                    {/* Truncated Instructions if any */}
                    {instructions && medications.length > 0 && (
                        <p className="text-xs text-muted-foreground line-clamp-1 italic bg-muted/30 rounded p-2" title={instructions}>
                            &ldquo;{instructions}&rdquo;
                        </p>
                    )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDetailsOpen(true)}
                        className="h-8 text-xs font-medium border-border text-foreground hover:bg-muted/40"
                    >
                        <Eye className="mr-1.5 h-3.5 w-3.5 text-primary" />
                        View Details
                    </Button>

                    {prescription.pdfUrl ? (
                        <Button
                            asChild
                            size="sm"
                            className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                        >
                            <a
                                href={prescription.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileDown className="mr-1.5 h-3.5 w-3.5" />
                                Download PDF
                            </a>
                        </Button>
                    ) : (
                        <Button
                            disabled
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-muted-foreground"
                        >
                            No PDF Available
                        </Button>
                    )}
                </div>
            </div>

            {/* Details Dialog */}
            <PatientPrescriptionDetailsDialog
                prescription={prescription}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
        </>
    );
}
