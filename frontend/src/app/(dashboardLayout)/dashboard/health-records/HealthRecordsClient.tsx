"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyPatientProfile } from "@/services/patient.services";
import HealthRecordsForm from "@/components/modules/Patient/HealthRecords/HealthRecordsForm";
import MedicalReportsSection from "@/components/modules/Patient/HealthRecords/MedicalReportsSection";
import {
    ArrowLeft,
    ClipboardList,
    FileText,
    HeartPulse,
    ShieldAlert,
    Activity,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const formatBloodGroupShort = (bg?: string) => {
    if (!bg) return "—";
    return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
};

export default function HealthRecordsClient() {
    const [activeTab, setActiveTab] = useState<"profile" | "reports">("profile");

    const { data: profileResponse, isLoading } = useQuery({
        queryKey: ["my-patient-profile"],
        queryFn: getMyPatientProfile,
        staleTime: 30 * 1000,
    });

    const profile = profileResponse?.data;
    const healthData = profile?.patientHealthData;
    const reportCount = profile?.medicalReports?.length || 0;

    return (
        <div className="mx-auto w-full min-w-0 max-w-screen-2xl space-y-5 px-4 sm:px-6">
            {/* Header Banner */}
            <div className="rounded-2xl border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-2xs">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="size-3.5" /> Back to Dashboard
                            </Link>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Health Records & Clinical Profile
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Maintain your verified biometric measurements, chronic allergies, and diagnostic test documents in one secure medical file.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                            <ShieldCheck className="size-3.5" />
                            HIPAA Aware & Encrypted
                        </span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-12 w-80 rounded-xl" />
                    <Skeleton className="h-80 w-full rounded-xl" />
                </div>
            ) : (
                <>
                    {/* Top Clinical Summary Vitals Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <HeartPulse className="size-4 text-primary" />
                                <span>Blood Group</span>
                            </div>
                            <div className="mt-2 text-lg font-bold tabular-nums text-foreground">
                                {formatBloodGroupShort(healthData?.bloodGroup)}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Activity className="size-4 text-secondary" />
                                <span>Vitals (Height / Weight)</span>
                            </div>
                            <div className="mt-2 text-sm font-semibold tabular-nums text-foreground truncate">
                                {healthData?.height && healthData?.weight
                                    ? `${healthData.height} · ${healthData.weight}`
                                    : "Not recorded"}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <ShieldAlert className="size-4 text-destructive" />
                                <span>Allergies Status</span>
                            </div>
                            <div className="mt-2 text-sm font-semibold text-foreground">
                                {healthData?.hasAllergies ? (
                                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                                        Allergies Noted
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground text-xs">No known allergies</span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <FileText className="size-4 text-primary" />
                                <span>Diagnostic Reports</span>
                            </div>
                            <div className="mt-2 text-sm font-semibold tabular-nums text-foreground">
                                {reportCount} {reportCount === 1 ? "document" : "documents stored"}
                            </div>
                        </div>
                    </div>

                    {/* Segmented Control Navigation */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div
                            className="inline-flex items-center rounded-xl bg-muted/60 p-1 border border-border/60"
                            role="tablist"
                            aria-label="Health records view sections"
                        >
                            <button
                                type="button"
                                role="tab"
                                id="tab-profile"
                                aria-selected={activeTab === "profile"}
                                aria-controls="panel-profile"
                                onClick={() => setActiveTab("profile")}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                                    activeTab === "profile"
                                        ? "bg-card text-foreground font-semibold shadow-2xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <ClipboardList className="size-4" />
                                <span>Clinical Profile & Vitals</span>
                            </button>

                            <button
                                type="button"
                                role="tab"
                                id="tab-reports"
                                aria-selected={activeTab === "reports"}
                                aria-controls="panel-reports"
                                onClick={() => setActiveTab("reports")}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                                    activeTab === "reports"
                                        ? "bg-card text-foreground font-semibold shadow-2xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <FileText className="size-4" />
                                <span>Diagnostic Reports</span>
                                <span className="ml-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary">
                                    {reportCount}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Panels */}
                    <div
                        id="panel-profile"
                        role="tabpanel"
                        aria-labelledby="tab-profile"
                        className={activeTab === "profile" ? "block space-y-6" : "hidden"}
                    >
                        <HealthRecordsForm profile={profile} />
                    </div>

                    <div
                        id="panel-reports"
                        role="tabpanel"
                        aria-labelledby="tab-reports"
                        className={activeTab === "reports" ? "block space-y-6" : "hidden"}
                    >
                        <MedicalReportsSection medicalReports={profile?.medicalReports || []} />
                    </div>
                </>
            )}
        </div>
    );
}
