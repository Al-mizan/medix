"use client";

import { useState, useRef } from "react";
import { IMedicalReport } from "@/types/patient.types";
import { uploadMedicalReportAction, deleteMedicalReportAction } from "@/app/(dashboardLayout)/dashboard/health-records/_action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    FileText,
    UploadCloud,
    Trash2,
    ExternalLink,
    Loader2,
    Calendar,
    FileCheck2,
    AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface MedicalReportsSectionProps {
    medicalReports?: IMedicalReport[];
}

const formatDateSafe = (dateVal?: string | Date | null, formatStr = "MMM d, yyyy") => {
    if (!dateVal) return "Uploaded";
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "Uploaded";
        return format(d, formatStr);
    } catch {
        return "Uploaded";
    }
};

export default function MedicalReportsSection({
    medicalReports = [],
}: MedicalReportsSectionProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [reportName, setReportName] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [reportToDelete, setReportToDelete] = useState<IMedicalReport | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!reportName.trim()) {
                const baseName = file.name.replace(/\.[^/.]+$/, "");
                setReportName(baseName);
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please choose a file to upload");
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error("File size exceeds 10MB limit. Please select a smaller file.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("reportName", reportName.trim() || selectedFile.name);

            const result = await uploadMedicalReportAction(formData);

            if (!result.success) {
                toast.error(result.message || "Failed to upload medical report");
                return;
            }

            toast.success("Medical report uploaded successfully");
            setReportName("");
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await queryClient.invalidateQueries({ queryKey: ["my-patient-profile"] });
            router.refresh();
        } catch {
            toast.error("An error occurred while uploading the medical report");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!reportToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteMedicalReportAction(reportToDelete.id);

            if (!result.success) {
                toast.error(result.message || "Failed to delete medical report");
                return;
            }

            toast.success("Medical report deleted successfully");
            setReportToDelete(null);

            await queryClient.invalidateQueries({ queryKey: ["my-patient-profile"] });
            router.refresh();
        } catch {
            toast.error("An error occurred while deleting the medical report");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 pt-4">
            {/* Header */}
            <div className="rounded-xl border border-[#E3E6EB] bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 border-b border-[#E3E6EB] pb-4 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E1F3F6] text-[#0B7285]">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#101828]">
                            Medical Reports & Diagnostic Documents
                        </h2>
                        <p className="text-sm text-[#5B6472]">
                            Upload and store lab results, imaging scans, and hospital discharge summaries to share with your doctors.
                        </p>
                    </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleUpload} className="rounded-lg border border-dashed border-[#0B7285]/30 bg-[#F7F8FA] p-5 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="reportName" className="text-xs font-semibold text-[#101828]">
                                Report / Document Title
                            </Label>
                            <Input
                                id="reportName"
                                placeholder="e.g. Complete Blood Count (CBC) - Aug 2026"
                                value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                                className="bg-white border-[#E3E6EB] text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="reportFile" className="text-xs font-semibold text-[#101828]">
                                Select File (PDF, PNG, JPG)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="reportFile"
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="bg-white border-[#E3E6EB] text-sm cursor-pointer file:cursor-pointer file:text-xs file:font-semibold file:bg-[#E1F3F6] file:text-[#0B7285] file:border-0 file:rounded-md file:mr-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-[#5B6472]">
                            <AlertCircle className="h-3.5 w-3.5 text-[#0B7285]" />
                            <span>Supported formats: PDF, JPEG, PNG. Maximum size 10MB per file.</span>
                        </div>

                        <Button
                            type="submit"
                            disabled={!selectedFile || isUploading}
                            className="w-full sm:w-auto bg-[#D9542E] hover:bg-[#B8431F] text-white font-medium text-xs px-5 py-2 h-9 shadow-xs"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Upload Document
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Reports List */}
                <div className="mt-8 space-y-3">
                    <h3 className="text-sm font-semibold text-[#101828] flex items-center gap-2">
                        <FileCheck2 className="h-4 w-4 text-[#178A5E]" />
                        Uploaded Reports ({medicalReports.length})
                    </h3>

                    {medicalReports.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[#E3E6EB] bg-[#F7F8FA] p-8 text-center">
                            <FileText className="mx-auto h-8 w-8 text-[#8A93A3] mb-2" />
                            <p className="text-sm font-medium text-[#101828]">No medical reports uploaded yet</p>
                            <p className="text-xs text-[#5B6472] mt-1 max-w-sm mx-auto">
                                Keep all your diagnostic tests and lab reports organized in one secure place for your consultations.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {medicalReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="group flex flex-col justify-between rounded-lg border border-[#E3E6EB] bg-white p-4 shadow-xs transition hover:border-[#0B7285]/40 hover:shadow-sm"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E1F3F6] text-[#0B7285]">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <span className="inline-flex items-center gap-1 rounded bg-[#F7F8FA] px-2 py-0.5 text-[10px] font-medium text-[#5B6472]">
                                                <Calendar className="h-2.5 w-2.5" />
                                                {formatDateSafe(report.createdAt)}
                                            </span>
                                        </div>

                                        <h4
                                            className="text-sm font-semibold text-[#101828] line-clamp-2"
                                            title={report.reportName}
                                        >
                                            {report.reportName}
                                        </h4>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-[#E3E6EB] pt-3">
                                        <a
                                            href={report.reportLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-medium text-[#0B7285] hover:text-[#095E70] hover:underline"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View Report
                                        </a>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setReportToDelete(report)}
                                            className="h-7 px-2 text-[#D8464B] hover:bg-[#FCEBEB] hover:text-[#D8464B]"
                                            title="Delete report"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog
                open={!!reportToDelete}
                onOpenChange={(open) => !open && setReportToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Medical Report?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &ldquo;{reportToDelete?.reportName}&rdquo;? This document will be permanently removed from your medical records and cannot be recovered.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-[#D8464B] hover:bg-[#D8464B]/90 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Report"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
