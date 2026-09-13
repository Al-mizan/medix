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
            <div className="flex flex-col justify-between rounded-xl border border-[#E3E6EB] bg-white p-5 shadow-xs transition hover:border-[#0B7285]/40 hover:shadow-md">
                <div className="space-y-4">
                    {/* Header: Doctor Info & Follow-up badge */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-11 w-11 border border-[#E3E6EB]">
                                <AvatarImage
                                    src={prescription.doctor?.profilePhoto || undefined}
                                    alt={doctorName}
                                />
                                <AvatarFallback className="bg-[#E1F3F6] text-[#075463] font-semibold text-xs">
                                    {getInitials(doctorName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-sm font-bold text-[#101828]">
                                    {doctorName}
                                </h3>
                                <p className="text-xs text-[#5B6472]">
                                    {doctorDesignation}
                                </p>
                            </div>
                        </div>

                        {prescription.followUpDate && formatDateSafe(prescription.followUpDate, "MMM d") !== "N/A" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E1F3F6] px-2.5 py-1 text-[11px] font-semibold text-[#075463]">
                                <Stethoscope className="h-3 w-3 text-[#0B7285]" />
                                Next: {formatDateSafe(prescription.followUpDate, "MMM d")}
                            </span>
                        )}
                    </div>

                    {/* Dates strip */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-[#F7F8FA] px-3.5 py-2 text-[11px] text-[#5B6472]">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#0B7285]" />
                            <strong className="text-[#101828]">Consultation:</strong>{" "}
                            {formatDateSafe(appointmentDate, "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#0B7285]" />
                            <strong className="text-[#101828]">Prescribed:</strong>{" "}
                            {formatDateSafe(prescription.createdAt, "MMM d, yyyy")}
                        </span>
                    </div>

                    {/* Medications Preview */}
                    <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6472] flex items-center gap-1">
                            <Pill className="h-3 w-3 text-[#0B7285]" />
                            Prescribed Medications ({medications.length})
                        </span>
                        {medications.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {medications.slice(0, 3).map((med, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center rounded-md bg-[#F7F8FA] border border-[#E3E6EB] px-2 py-0.5 text-xs font-medium text-[#101828]"
                                    >
                                        {med.name}
                                        {med.dosage && (
                                            <span className="ml-1 text-[10px] text-[#5B6472]">
                                                ({med.dosage})
                                            </span>
                                        )}
                                    </span>
                                ))}
                                {medications.length > 3 && (
                                    <span className="inline-flex items-center rounded-md bg-[#E1F3F6] px-2 py-0.5 text-xs font-medium text-[#075463]">
                                        +{medications.length - 3} more
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-[#5B6472] italic line-clamp-2">
                                {instructions || "Clinical instructions provided."}
                            </p>
                        )}
                    </div>

                    {/* Truncated Instructions if any */}
                    {instructions && medications.length > 0 && (
                        <p className="text-xs text-[#5B6472] line-clamp-1 italic bg-[#F7F8FA] rounded p-2">
                            &ldquo;{instructions}&rdquo;
                        </p>
                    )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-[#E3E6EB] pt-4 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDetailsOpen(true)}
                        className="h-8 text-xs font-medium border-[#E3E6EB] text-[#101828] hover:bg-[#F7F8FA]"
                    >
                        <Eye className="mr-1.5 h-3.5 w-3.5 text-[#0B7285]" />
                        View Details
                    </Button>

                    {prescription.pdfUrl ? (
                        <Button
                            asChild
                            size="sm"
                            className="h-8 text-xs font-medium bg-[#0B7285] hover:bg-[#095E70] text-white shadow-xs"
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
                            className="h-8 text-xs text-[#8A93A3]"
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
