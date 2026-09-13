"use client";

import { IPrescription } from "@/types/prescription.types";
import { parsePrescriptionInstructions } from "@/zod/prescription.validation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    FileDown,
    Calendar,
    Stethoscope,
    Pill,
    Clock,
    AlertCircle,
    User,
} from "lucide-react";
import { format } from "date-fns";

interface PatientPrescriptionDetailsDialogProps {
    prescription: IPrescription | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const getInitials = (name?: string) => {
    if (!name) return "DR";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDateSafe = (dateVal?: string | Date | null, formatStr = "PPP") => {
    if (!dateVal) return "N/A";
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "N/A";
        return format(d, formatStr);
    } catch {
        return "N/A";
    }
};

export default function PatientPrescriptionDetailsDialog({
    prescription,
    open,
    onOpenChange,
}: PatientPrescriptionDetailsDialogProps) {
    if (!prescription) return null;

    const { medications, instructions } = parsePrescriptionInstructions(
        prescription.instructions || ""
    );

    const doctorName = prescription.doctor?.name || "Attending Physician";
    const doctorDesignation = prescription.doctor?.designation || "Medical Specialist";
    const appointmentDate = prescription.appointment?.schedule?.startDateTime || prescription.createdAt;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <div className="bg-[#0B7285] p-6 text-white rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-white/40">
                                <AvatarImage
                                    src={prescription.doctor?.profilePhoto || undefined}
                                    alt={doctorName}
                                />
                                <AvatarFallback className="bg-white/20 text-white font-semibold">
                                    {getInitials(doctorName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-xl font-bold text-white">
                                    Prescription Details
                                </DialogTitle>
                                <p className="text-xs text-white/80 mt-0.5">
                                    Issued by {doctorName} • {doctorDesignation}
                                </p>
                            </div>
                        </div>

                        {prescription.pdfUrl && (
                            <Button
                                asChild
                                size="sm"
                                className="bg-white text-[#0B7285] hover:bg-white/90 font-medium text-xs shadow-xs"
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
                        )}
                    </div>
                </div>

                <DialogDescription className="sr-only">
                    Full prescription details including prescribed medications, dosage instructions, and follow-up consultation date.
                </DialogDescription>

                <div className="p-6 space-y-6">
                    {/* Metadata Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E3E6EB] text-xs">
                        <div>
                            <span className="text-[#5B6472] block">Consultation Date</span>
                            <span className="font-semibold text-[#101828] flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3.5 w-3.5 text-[#0B7285]" />
                                {formatDateSafe(appointmentDate, "PPP")}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#5B6472] block">Prescription Issued</span>
                            <span className="font-semibold text-[#101828] flex items-center gap-1 mt-0.5">
                                <Clock className="h-3.5 w-3.5 text-[#0B7285]" />
                                {formatDateSafe(prescription.createdAt, "PPP")}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#5B6472] block">Follow-up Date</span>
                            <span className="font-semibold text-[#075463] flex items-center gap-1 mt-0.5">
                                <Stethoscope className="h-3.5 w-3.5 text-[#0B7285]" />
                                {prescription.followUpDate
                                    ? formatDateSafe(prescription.followUpDate, "PPP")
                                    : "As needed"}
                            </span>
                        </div>
                    </div>

                    {/* Medications Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-[#E3E6EB] pb-2">
                            <Pill className="h-4 w-4 text-[#0B7285]" />
                            <h3 className="text-sm font-semibold text-[#101828]">
                                Prescribed Medications ({medications.length})
                            </h3>
                        </div>

                        {medications.length > 0 ? (
                            <div className="rounded-lg border border-[#E3E6EB] overflow-hidden">
                                <div className="grid grid-cols-12 bg-[#F7F8FA] px-4 py-2.5 text-[11px] font-semibold text-[#5B6472] uppercase tracking-wider">
                                    <div className="col-span-4">Medicine</div>
                                    <div className="col-span-3">Dosage</div>
                                    <div className="col-span-3">Frequency</div>
                                    <div className="col-span-2 text-right">Duration</div>
                                </div>
                                <div className="divide-y divide-[#E3E6EB]">
                                    {medications.map((med, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 items-center px-4 py-3 text-xs text-[#101828]"
                                        >
                                            <div className="col-span-4 font-semibold text-[#101828]">
                                                {med.name}
                                            </div>
                                            <div className="col-span-3 text-[#5B6472]">
                                                {med.dosage}
                                            </div>
                                            <div className="col-span-3">
                                                <span className="inline-flex rounded bg-[#E1F3F6] px-2 py-0.5 text-[11px] font-medium text-[#075463]">
                                                    {med.frequency}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-right text-[#5B6472]">
                                                {med.duration}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E3E6EB] text-xs text-[#5B6472] text-center">
                                No individual medications broken down. Please review clinical instructions below.
                            </div>
                        )}
                    </div>

                    {/* Additional Instructions / Advice */}
                    {instructions && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 border-b border-[#E3E6EB] pb-2">
                                <AlertCircle className="h-4 w-4 text-[#0B7285]" />
                                <h3 className="text-sm font-semibold text-[#101828]">
                                    Physician Advice & Special Instructions
                                </h3>
                            </div>
                            <div className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E3E6EB] text-xs leading-relaxed text-[#101828] whitespace-pre-line">
                                {instructions}
                            </div>
                        </div>
                    )}

                    {/* Patient Notice Footer */}
                    <div className="rounded-lg bg-[#E3F7EE] border border-[#178A5E]/20 p-3.5 flex items-start gap-2.5">
                        <Stethoscope className="h-4 w-4 text-[#178A5E] shrink-0 mt-0.5" />
                        <p className="text-[11px] text-[#0F5C3E] leading-normal">
                            Always consult your licensed physician or pharmacist before making any changes to your medication schedule. Keep prescriptions confidential.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
