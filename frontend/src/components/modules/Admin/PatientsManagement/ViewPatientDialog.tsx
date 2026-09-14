"use client";

import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
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
import { Separator } from "@/components/ui/separator";
import { type IPatient } from "@/types/patient.types";
import {
    ExternalLink,
    FileText,
    HeartPulse,
    Mail,
    MapPin,
    Phone,
    ShieldAlert,
} from "lucide-react";

interface ViewPatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: IPatient | null;
}

const ViewPatientDialog = ({
    open,
    onOpenChange,
    patient,
}: ViewPatientDialogProps) => {
    if (!patient) return null;

    const healthData = patient.patientHealthData;
    const reports = patient.medicalReports ?? [];
    const initials = patient.name
        ? patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "PT";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="text-xl">Patient Profile</DialogTitle>
                    <DialogDescription>
                        Complete information and health records for {patient.name}.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    {/* Basic Info Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4">
                        <Avatar className="h-16 w-16 border">
                            <AvatarImage
                                src={patient.profilePhoto || undefined}
                                alt={patient.name}
                            />
                            <AvatarFallback className="text-base font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {patient.name}
                                </h3>
                                <StatusBadgeCell status={patient.user.status} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{patient.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 shrink-0" />
                                    <span>{patient.contactNumber || "No contact"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:col-span-2">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span>{patient.address || "No address provided"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Patient Health Data Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <HeartPulse className="h-5 w-5 text-muted-foreground" />
                            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                Health & Medical Metrics
                            </h4>
                        </div>

                        {healthData ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-muted/40 p-3 rounded-md border text-center">
                                        <span className="text-xs text-muted-foreground block">
                                            Gender
                                        </span>
                                        <span className="text-sm font-medium capitalize">
                                            {healthData.gender?.toLowerCase() || "—"}
                                        </span>
                                    </div>
                                    <div className="bg-muted/40 p-3 rounded-md border text-center">
                                        <span className="text-xs text-muted-foreground block">
                                            Blood Group
                                        </span>
                                        <span className="text-sm font-medium">
                                            {healthData.bloodGroup?.replace("_", " ") || "—"}
                                        </span>
                                    </div>
                                    <div className="bg-muted/40 p-3 rounded-md border text-center">
                                        <span className="text-xs text-muted-foreground block">
                                            Height
                                        </span>
                                        <span className="text-sm font-medium">
                                            {healthData.height ? `${healthData.height} cm` : "—"}
                                        </span>
                                    </div>
                                    <div className="bg-muted/40 p-3 rounded-md border text-center">
                                        <span className="text-xs text-muted-foreground block">
                                            Weight
                                        </span>
                                        <span className="text-sm font-medium">
                                            {healthData.weight ? `${healthData.weight} kg` : "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="flex justify-between py-1.5 border-b">
                                        <span className="text-muted-foreground">Date of Birth:</span>
                                        <span className="font-medium">
                                            {healthData.dateOfBirth
                                                ? new Date(healthData.dateOfBirth).toLocaleDateString()
                                                : "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b">
                                        <span className="text-muted-foreground">Marital Status:</span>
                                        <span className="font-medium capitalize">
                                            {healthData.maritalStatus || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b">
                                        <span className="text-muted-foreground">Dietary Preferences:</span>
                                        <span className="font-medium">
                                            {healthData.dietaryPreferences || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b">
                                        <span className="text-muted-foreground">Smoking Status:</span>
                                        <span className="font-medium">
                                            {healthData.smokingStatus ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <span className="text-xs font-medium text-muted-foreground block">
                                        Health Indicators & Conditions
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {healthData.hasAllergies && (
                                            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-50 dark:bg-amber-950/20 text-xs">
                                                Allergies
                                            </Badge>
                                        )}
                                        {healthData.hasDiabetes && (
                                            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-50 dark:bg-amber-950/20 text-xs">
                                                Diabetes
                                            </Badge>
                                        )}
                                        {healthData.hasPastSurgeries && (
                                            <Badge variant="outline" className="text-xs">
                                                Past Surgeries
                                            </Badge>
                                        )}
                                        {healthData.pregnancyStatus && (
                                            <Badge variant="outline" className="text-xs">
                                                Pregnant
                                            </Badge>
                                        )}
                                        {healthData.immunizationStatus && (
                                            <Badge variant="outline" className="text-xs">
                                                Immunized
                                            </Badge>
                                        )}
                                        {healthData.recentAnxiety && (
                                            <Badge variant="outline" className="text-xs">
                                                Recent Anxiety
                                            </Badge>
                                        )}
                                        {healthData.recentDepression && (
                                            <Badge variant="outline" className="text-xs">
                                                Recent Depression
                                            </Badge>
                                        )}
                                        {!healthData.hasAllergies &&
                                            !healthData.hasDiabetes &&
                                            !healthData.hasPastSurgeries &&
                                            !healthData.recentAnxiety &&
                                            !healthData.recentDepression && (
                                                <span className="text-xs text-muted-foreground">
                                                    No major health flags recorded.
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground py-2 italic">
                                No health data submitted by this patient yet.
                            </p>
                        )}
                    </div>

                    <Separator className="my-4" />

                    {/* Medical Reports Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                    Medical Reports ({reports.length})
                                </h4>
                            </div>
                        </div>

                        {reports.length > 0 ? (
                            <div className="space-y-2">
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex items-center justify-between p-3 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-medium truncate">
                                                    {report.reportName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Uploaded: {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1.5 shrink-0"
                                            asChild
                                        >
                                            <a
                                                href={report.reportLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                <span>View</span>
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground py-2 italic">
                                No medical reports uploaded.
                            </p>
                        )}
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

export default ViewPatientDialog;
