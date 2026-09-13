"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    HeartPulse,
    Loader2,
    Save,
    ShieldAlert,
    Stethoscope,
    User,
} from "lucide-react";

import { updatePatientHealthDataAction } from "@/app/(dashboardLayout)/dashboard/health-records/_action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    BloodGroup,
    Gender,
    IPatientHealthData,
    IPatientProfile,
} from "@/types/patient.types";
import {
    BloodGroupValues,
    GenderValues,
    patientHealthDataFormSchema,
} from "@/zod/patient.validation";

interface HealthRecordsFormProps {
    profile?: IPatientProfile | null;
}

const BLOOD_GROUP_LABELS: Record<BloodGroup, string> = {
    A_POSITIVE: "A+ (A Positive)",
    A_NEGATIVE: "A- (A Negative)",
    B_POSITIVE: "B+ (B Positive)",
    B_NEGATIVE: "B- (B Negative)",
    AB_POSITIVE: "AB+ (AB Positive)",
    AB_NEGATIVE: "AB- (AB Negative)",
    O_POSITIVE: "O+ (O Positive)",
    O_NEGATIVE: "O- (O Negative)",
};

const GENDER_LABELS: Record<Gender, string> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
};

const MARITAL_STATUS_OPTIONS = [
    "Single",
    "Married",
    "Divorced",
    "Widowed",
    "Separated",
    "Other",
];

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
            <Card className="border-[#E3E6EB] shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#E1F3F6] text-[#0B7285]">
                            <User className="size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-[#101828]">
                                Demographics
                            </CardTitle>
                            <CardDescription className="text-xs text-[#5B6472]">
                                Personal identity, biological sex, and birth date details
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Gender */}
                    <form.Field name="gender">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="gender" className="text-xs font-medium text-[#101828]">
                                    Gender <span className="text-[#D8464B]">*</span>
                                </Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(val) => field.handleChange(val as Gender)}
                                >
                                    <SelectTrigger id="gender" className="w-full">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GenderValues.map((g) => (
                                            <SelectItem key={g} value={g}>
                                                {GENDER_LABELS[g]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    {/* Date of Birth */}
                    <form.Field name="dateOfBirth">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="dateOfBirth" className="text-xs font-medium text-[#101828]">
                                    Date of Birth <span className="text-[#D8464B]">*</span>
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    max={format(new Date(), "yyyy-MM-dd")}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </form.Field>

                    {/* Marital Status */}
                    <form.Field name="maritalStatus">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="maritalStatus" className="text-xs font-medium text-[#101828]">
                                    Marital Status
                                </Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(val) => field.handleChange(val)}
                                >
                                    <SelectTrigger id="maritalStatus" className="w-full">
                                        <SelectValue placeholder="Select marital status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MARITAL_STATUS_OPTIONS.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            {/* Section 2: Biometrics & Vitals */}
            <Card className="border-[#E3E6EB] shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#E1F3F6] text-[#0B7285]">
                            <HeartPulse className="size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-[#101828]">
                                Biometrics & Vitals
                            </CardTitle>
                            <CardDescription className="text-xs text-[#5B6472]">
                                Blood group, body measurements, and physical vital signs
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Blood Group */}
                    <form.Field name="bloodGroup">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="bloodGroup" className="text-xs font-medium text-[#101828]">
                                    Blood Group <span className="text-[#D8464B]">*</span>
                                </Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(val) => field.handleChange(val as BloodGroup)}
                                >
                                    <SelectTrigger id="bloodGroup" className="w-full">
                                        <SelectValue placeholder="Select blood group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BloodGroupValues.map((group) => (
                                            <SelectItem key={group} value={group}>
                                                {BLOOD_GROUP_LABELS[group]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    {/* Height */}
                    <form.Field name="height">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="height" className="text-xs font-medium text-[#101828]">
                                    Height (cm) <span className="text-[#D8464B]">*</span>
                                </Label>
                                <Input
                                    id="height"
                                    type="text"
                                    placeholder="e.g. 175 cm"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </form.Field>

                    {/* Weight */}
                    <form.Field name="weight">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="weight" className="text-xs font-medium text-[#101828]">
                                    Weight (kg) <span className="text-[#D8464B]">*</span>
                                </Label>
                                <Input
                                    id="weight"
                                    type="text"
                                    placeholder="e.g. 70 kg"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            {/* Section 3: Chronic Conditions & Allergies */}
            <Card className="border-[#E3E6EB] shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#FBEAE3] text-[#D9542E]">
                            <ShieldAlert className="size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-[#101828]">
                                Chronic Conditions & Allergies
                            </CardTitle>
                            <CardDescription className="text-xs text-[#5B6472]">
                                Essential alerts regarding sensitivities, past procedures, and chronic illnesses
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Has Allergies */}
                    <form.Field name="hasAllergies">
                        {(field) => (
                            <div className="flex items-center justify-between rounded-lg border border-[#E3E6EB] p-4 bg-white shadow-2xs">
                                <div className="space-y-0.5 pr-2">
                                    <Label htmlFor="hasAllergies" className="text-xs font-semibold text-[#101828] cursor-pointer">
                                        Allergies
                                    </Label>
                                    <p className="text-[11px] text-[#5B6472]">
                                        Food, medication, or seasonal reactions
                                    </p>
                                </div>
                                <Switch
                                    id="hasAllergies"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
                            </div>
                        )}
                    </form.Field>

                    {/* Has Diabetes */}
                    <form.Field name="hasDiabetes">
                        {(field) => (
                            <div className="flex items-center justify-between rounded-lg border border-[#E3E6EB] p-4 bg-white shadow-2xs">
                                <div className="space-y-0.5 pr-2">
                                    <Label htmlFor="hasDiabetes" className="text-xs font-semibold text-[#101828] cursor-pointer">
                                        Diabetes
                                    </Label>
                                    <p className="text-[11px] text-[#5B6472]">
                                        Type 1, Type 2, or pre-diabetes
                                    </p>
                                </div>
                                <Switch
                                    id="hasDiabetes"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
                            </div>
                        )}
                    </form.Field>

                    {/* Has Past Surgeries */}
                    <form.Field name="hasPastSurgeries">
                        {(field) => (
                            <div className="flex items-center justify-between rounded-lg border border-[#E3E6EB] p-4 bg-white shadow-2xs">
                                <div className="space-y-0.5 pr-2">
                                    <Label htmlFor="hasPastSurgeries" className="text-xs font-semibold text-[#101828] cursor-pointer">
                                        Past Surgeries
                                    </Label>
                                    <p className="text-[11px] text-[#5B6472]">
                                        Prior inpatient surgical procedures
                                    </p>
                                </div>
                                <Switch
                                    id="hasPastSurgeries"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

            {/* Section 4: Lifestyle & Clinical History */}
            <Card className="border-[#E3E6EB] shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#E3F7EE] text-[#178A5E]">
                            <Stethoscope className="size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-[#101828]">
                                Lifestyle & Clinical History
                            </CardTitle>
                            <CardDescription className="text-xs text-[#5B6472]">
                                Daily health habits, nutrition, immunization, and mental well-being
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Toggle row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Smoking Status */}
                        <form.Field name="smokingStatus">
                            {(field) => (
                                <div className="flex items-center justify-between rounded-lg border border-[#E3E6EB] p-4 bg-white shadow-2xs">
                                    <div className="space-y-0.5 pr-2">
                                        <Label htmlFor="smokingStatus" className="text-xs font-semibold text-[#101828] cursor-pointer">
                                            Smoker
                                        </Label>
                                        <p className="text-[11px] text-[#5B6472]">Tobacco or vape</p>
                                    </div>
                                    <Switch
                                        id="smokingStatus"
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => field.handleChange(checked)}
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Pregnancy Status */}
                        <form.Field name="pregnancyStatus">
                            {(field) => (
                                <div className="flex items-center justify-between rounded-lg border border-[#E3E6EB] p-4 bg-white shadow-2xs">
                                    <div className="space-y-0.5 pr-2">
                                        <Label htmlFor="pregnancyStatus" className="text-xs font-semibold text-[#101828] cursor-pointer">
                                            Pregnant
                                        </Label>
                                        <p className="text-[11px] text-[#5B6472]">Currently expecting</p>
                                    </div>
                                    <Switch
                                        id="pregnancyStatus"
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => field.handleChange(checked)}
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Recent Anxiety */}
                        <form.Field name="recentAnxiety">
                            {(field) => (
                                <div className="flex items-center justify-between rounded-lg border border-[#E3E6EB] p-4 bg-white shadow-2xs">
                                    <div className="space-y-0.5 pr-2">
                                        <Label htmlFor="recentAnxiety" className="text-xs font-semibold text-[#101828] cursor-pointer">
                                            Recent Anxiety
                                        </Label>
                                        <p className="text-[11px] text-[#5B6472]">Past 6 months</p>
                                    </div>
                                    <Switch
                                        id="recentAnxiety"
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => field.handleChange(checked)}
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Recent Depression */}
                        <form.Field name="recentDepression">
                            {(field) => (
                                <div className="flex items-center justify-between rounded-lg border border-[#E3E6EB] p-4 bg-white shadow-2xs">
                                    <div className="space-y-0.5 pr-2">
                                        <Label htmlFor="recentDepression" className="text-xs font-semibold text-[#101828] cursor-pointer">
                                            Recent Depression
                                        </Label>
                                        <p className="text-[11px] text-[#5B6472]">Persistent low mood</p>
                                    </div>
                                    <Switch
                                        id="recentDepression"
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => field.handleChange(checked)}
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    {/* Text Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Dietary Preferences */}
                        <form.Field name="dietaryPreferences">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="dietaryPreferences" className="text-xs font-medium text-[#101828]">
                                        Dietary Preferences
                                    </Label>
                                    <Input
                                        id="dietaryPreferences"
                                        type="text"
                                        placeholder="e.g. Vegetarian, Halal, Gluten-Free, Low Sodium"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Immunization Status */}
                        <form.Field name="immunizationStatus">
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="immunizationStatus" className="text-xs font-medium text-[#101828]">
                                        Immunization Status
                                    </Label>
                                    <Input
                                        id="immunizationStatus"
                                        type="text"
                                        placeholder="e.g. Up to date (COVID-19, Tetanus, Flu)"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    {/* Mental Health History */}
                    <form.Field name="mentalHealthHistory">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="mentalHealthHistory" className="text-xs font-medium text-[#101828]">
                                    Mental Health History & Clinical Notes
                                </Label>
                                <Textarea
                                    id="mentalHealthHistory"
                                    rows={3}
                                    placeholder="Provide any relevant background regarding therapy, counseling, or past psychiatric treatments..."
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="resize-y"
                                />
                            </div>
                        )}
                    </form.Field>
                </CardContent>
            </Card>

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
