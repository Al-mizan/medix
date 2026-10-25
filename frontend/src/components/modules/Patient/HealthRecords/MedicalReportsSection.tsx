"use client";

import { useState, useRef, useMemo, DragEvent } from "react";
import { IMedicalReport } from "@/types/patient.types";
import { uploadMedicalReportAction, deleteMedicalReportAction } from "@/app/(dashboardLayout)/dashboard/health-records/_action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    X,
    FileType,
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

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getReportExtensionBadge = (reportName: string, reportLink: string): string => {
    const fromName = reportName.split(".").pop()?.toUpperCase();
    if (fromName && ["PDF", "PNG", "JPG", "JPEG", "WEBP"].includes(fromName)) {
        return fromName;
    }
    const fromLink = reportLink.split(".").pop()?.toUpperCase();
    if (fromLink && ["PDF", "PNG", "JPG", "JPEG", "WEBP"].includes(fromLink)) {
        return fromLink;
    }
    return "DOC";
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
    const [isDragging, setIsDragging] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"ALL" | "PDF" | "IMG">("ALL");

    const [reportToDelete, setReportToDelete] = useState<IMedicalReport | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredReports = useMemo(() => {
        if (activeFilter === "ALL") return medicalReports;
        if (activeFilter === "PDF") {
            return medicalReports.filter((r) =>
                getReportExtensionBadge(r.reportName, r.reportLink) === "PDF"
            );
        }
        return medicalReports.filter((r) =>
            ["PNG", "JPG", "JPEG", "WEBP"].includes(
                getReportExtensionBadge(r.reportName, r.reportLink)
            )
        );
    }, [medicalReports, activeFilter]);

    const processSelectedFile = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size exceeds 10MB limit. Please select a smaller file.");
            return;
        }
        setSelectedFile(file);
        if (!reportName.trim()) {
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            setReportName(baseName);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processSelectedFile(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processSelectedFile(file);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "An error occurred while uploading the medical report";
            toast.error(message);
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
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "An error occurred while deleting the medical report";
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Upload Dropzone Card */}
            <Card className="border-border bg-card text-card-foreground shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UploadCloud className="size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-foreground">
                                Upload Diagnostic Document
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Store lab tests, blood work, radiology scans, or prescription PDFs
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative rounded-xl border-2 border-dashed p-6 transition-colors ${
                                isDragging
                                    ? "border-primary bg-primary/10"
                                    : "border-border bg-muted/20 hover:border-primary/40"
                            }`}
                        >
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="reportName" className="text-xs font-semibold text-foreground">
                                        Report / Document Title
                                    </Label>
                                    <Input
                                        id="reportName"
                                        placeholder="e.g. Complete Blood Count (CBC) - Aug 2026"
                                        value={reportName}
                                        onChange={(e) => setReportName(e.target.value)}
                                        className="bg-background border-border text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="reportFile" className="text-xs font-semibold text-foreground">
                                        Select or Drop Document (PDF, PNG, JPG)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="reportFile"
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="bg-background border-border text-sm cursor-pointer file:cursor-pointer file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:mr-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Staged File Feedback */}
                            {selectedFile && (
                                <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileType className="size-4 text-primary shrink-0" />
                                        <span className="font-semibold text-foreground truncate">
                                            {selectedFile.name}
                                        </span>
                                        <span className="text-muted-foreground tabular-nums">
                                            ({formatFileSize(selectedFile.size)})
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearFile}
                                        className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                                        title="Remove file"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <AlertCircle className="size-3.5 text-primary shrink-0" />
                                <span>Supported formats: PDF, JPEG, PNG, WEBP. Maximum file size 10MB per report.</span>
                            </div>

                            <Button
                                type="submit"
                                disabled={!selectedFile || isUploading}
                                className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs px-5 py-2 h-9 shadow-xs transition-colors cursor-pointer"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                                        Uploading Document...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="mr-2 size-4" />
                                        Upload Document
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* 2. Stored Reports Vault Card */}
            <Card className="border-border bg-card text-card-foreground shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                                <FileCheck2 className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-foreground">
                                    Stored Diagnostic Reports
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Verified medical documents accessible to attending doctors
                                </CardDescription>
                            </div>
                        </div>

                        {/* Format Filter Chips */}
                        {medicalReports.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter("ALL")}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                                        activeFilter === "ALL"
                                            ? "bg-primary text-primary-foreground font-semibold"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    All ({medicalReports.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter("PDF")}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                                        activeFilter === "PDF"
                                            ? "bg-primary text-primary-foreground font-semibold"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    PDFs (
                                    {
                                        medicalReports.filter(
                                            (r) => getReportExtensionBadge(r.reportName, r.reportLink) === "PDF"
                                        ).length
                                    }
                                    )
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter("IMG")}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                                        activeFilter === "IMG"
                                            ? "bg-primary text-primary-foreground font-semibold"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Images (
                                    {
                                        medicalReports.filter((r) =>
                                            ["PNG", "JPG", "JPEG", "WEBP"].includes(
                                                getReportExtensionBadge(r.reportName, r.reportLink)
                                            )
                                        ).length
                                    }
                                    )
                                </button>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {filteredReports.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                            <FileText className="mx-auto size-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-foreground">
                                {medicalReports.length === 0
                                    ? "No medical reports uploaded yet"
                                    : "No reports match the selected format filter"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                Keep all your diagnostic tests and lab reports organized in one secure place for your consultations.
                            </p>
                            {medicalReports.length === 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-4 text-xs font-semibold cursor-pointer"
                                >
                                    <UploadCloud className="size-3.5 mr-1.5" />
                                    Select a file to upload
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredReports.map((report) => {
                                const extBadge = getReportExtensionBadge(report.reportName, report.reportLink);
                                return (
                                    <div
                                        key={report.id}
                                        className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs transition hover:border-primary/40 hover:shadow-xs"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                    <FileText className="size-4" />
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                                        {extBadge}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                                                        <Calendar className="size-2.5" />
                                                        {formatDateSafe(report.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <h4
                                                className="text-sm font-semibold text-foreground line-clamp-2"
                                                title={report.reportName}
                                            >
                                                {report.reportName}
                                            </h4>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                            <a
                                                href={report.reportLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
                                            >
                                                <ExternalLink className="size-3.5" />
                                                View Report
                                            </a>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setReportToDelete(report)}
                                                className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                                title="Delete report"
                                            >
                                                <Trash2 className="size-3.5" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

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
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
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
