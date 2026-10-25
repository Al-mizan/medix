"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Save,
} from "lucide-react";

import { updatePatientHealthDataAction } from "@/app/(dashboardLayout)/dashboard/health-records/_action";
import { Button } from "@/components/ui/button";
import {
    BloodGroup,
    Gender,
    IPatientHealthData,
    IPatientProfile,
} from "@/types/patient.types";
import { patientHealthDataFormSchema } from "@/zod/patient.validation";

import HealthRecordsDemographicsSection from "./HealthRecordsDemographicsSection";
import HealthRecordsBiometricsSection from "./HealthRecordsBiometricsSection";
import HealthRecordsChronicConditionsSection from "./HealthRecordsChronicConditionsSection";
import HealthRecordsLifestyleSection from "./HealthRecordsLifestyleSection";

interface HealthRecordsFormProps {
    profile?: IPatientProfile | null;
}

const formatDateForInput = (dateValue?: string | Date | null): string => {
    if (!dateValue) return "";
    try {
        if (typeof dateValue === "string") {
            const datePart = dateValue.split("T")[0];
            if (datePart && !isNaN(Date.parse(datePart))) {
                return datePart;
            }
        }
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return "";
        return format(d, "yyyy-MM-dd");
    } catch {
        return "";
    }
};

export default function HealthRecordsForm({ profile }: HealthRecordsFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const healthData: Partial<IPatientHealthData> = profile?.patientHealthData || {};

    const initialValues = {
        gender: (healthData.gender as Gender) || "MALE",
        dateOfBirth: formatDateForInput(healthData.dateOfBirth),
        maritalStatus: healthData.maritalStatus || "Single",
        bloodGroup: (healthData.bloodGroup as BloodGroup) || "O_POSITIVE",
        height: healthData.height || "",
        weight: healthData.weight || "",
        hasAllergies: Boolean(healthData.hasAllergies),
        hasDiabetes: Boolean(healthData.hasDiabetes),
        hasPastSurgeries: Boolean(healthData.hasPastSurgeries),
        smokingStatus: Boolean(healthData.smokingStatus),
        pregnancyStatus: Boolean(healthData.pregnancyStatus),
        recentAnxiety: Boolean(healthData.recentAnxiety),
        recentDepression: Boolean(healthData.recentDepression),
        dietaryPreferences: healthData.dietaryPreferences || "",
        immunizationStatus: healthData.immunizationStatus || "",
        mentalHealthHistory: healthData.mentalHealthHistory || "",
    };

    const form = useForm({
        defaultValues: initialValues,
        onSubmit: async ({ value }) => {
            setServerError(null);
            setFieldErrors({});
            setIsSubmitting(true);

            const parsed = patientHealthDataFormSchema.safeParse(value);
            if (!parsed.success) {
                const errorsMap: Record<string, string> = {};
                for (const issue of parsed.error.issues) {
                    const key = String(issue.path[0] || "");
                    if (key && !errorsMap[key]) {
                        errorsMap[key] = issue.message;
                    }
                }
                setFieldErrors(errorsMap);

                const firstIssue = parsed.error.issues[0];
                const msg = firstIssue
                    ? `${String(firstIssue.path[0] || "Field")}: ${firstIssue.message}`
                    : "Please review the highlighted fields";
                setServerError(msg);
                toast.error(msg);
                setIsSubmitting(false);

                // Focus the first invalid element
                if (firstIssue?.path[0]) {
                    const el = document.getElementById(String(firstIssue.path[0]));
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    el?.focus();
                }
                return;
            }

            try {
                const result = await updatePatientHealthDataAction(parsed.data);

                if (!result.success) {
                    setServerError(result.message || "Failed to update health records");
                    toast.error(result.message || "Failed to update health records");
                    return;
                }

                toast.success("Health records updated successfully!");
                await queryClient.invalidateQueries({ queryKey: ["my-patient-profile"] });
                await queryClient.invalidateQueries({ queryKey: ["patient-dashboard-stats"] });
                router.refresh();
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "An unexpected error occurred";
                setServerError(message);
                toast.error(message);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Keyboard shortcut (Cmd+S / Ctrl+S) for power users
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                form.handleSubmit();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [form]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            noValidate
            className="space-y-6 pt-2"
        >
            {serverError && (
                <div
                    role="alert"
                    aria-live="polite"
                    className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                >
                    <AlertCircle className="size-5 shrink-0 text-destructive" />
                    <span>{serverError}</span>
                </div>
            )}

            {/* Row 1: Core Demographics & Physical Vitals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HealthRecordsDemographicsSection form={form} fieldErrors={fieldErrors} />
                <HealthRecordsBiometricsSection form={form} fieldErrors={fieldErrors} />
            </div>

            {/* Section 2: Chronic Conditions & Allergies */}
            <HealthRecordsChronicConditionsSection form={form} />

            {/* Section 3: Lifestyle & Clinical History */}
            <HealthRecordsLifestyleSection form={form} />

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-secondary shrink-0" />
                    <span>Your clinical data is end-to-end encrypted and shared strictly with your attending physicians.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="hidden lg:inline text-xs text-muted-foreground tabular-nums">
                        Tip: Press <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] bg-muted">⌘S</kbd> to save
                    </span>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto min-w-[200px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Saving Profile...
                            </>
                        ) : (
                            <>
                                <Save className="size-4 mr-2" />
                                Save Health Profile
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
