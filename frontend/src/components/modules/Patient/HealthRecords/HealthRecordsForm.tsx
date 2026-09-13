"use client";

import { useState } from "react";
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
            setIsSubmitting(true);

            const parsed = patientHealthDataFormSchema.safeParse(value);
            if (!parsed.success) {
                const issue = parsed.error.issues[0];
                const msg = issue ? `${issue.path.join(".")}: ${issue.message}` : "Validation failed";
                setServerError(msg);
                toast.error(msg);
                setIsSubmitting(false);
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

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            noValidate
            className="space-y-8"
        >
            {serverError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-[#FCEBEB] p-4 text-sm text-[#7A2323]">
                    <AlertCircle className="size-5 shrink-0 text-[#D8464B]" />
                    <span>{serverError}</span>
                </div>
            )}

            {/* Section 1: Demographics */}
            <HealthRecordsDemographicsSection form={form} />

            {/* Section 2: Biometrics & Vitals */}
            <HealthRecordsBiometricsSection form={form} />

            {/* Section 3: Chronic Conditions & Allergies */}
            <HealthRecordsChronicConditionsSection form={form} />

            {/* Section 4: Lifestyle & Clinical History */}
            <HealthRecordsLifestyleSection form={form} />

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-[#5B6472]">
                    <CheckCircle2 className="size-4 text-[#178A5E]" />
                    <span>Your health data is encrypted and securely shared only with your treating physicians.</span>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-w-[200px] bg-[#D9542E] hover:bg-[#B8431F] text-white font-medium shadow-sm transition-colors cursor-pointer"
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
        </form>
    );
}
