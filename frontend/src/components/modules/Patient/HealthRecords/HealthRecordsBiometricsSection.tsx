import { HeartPulse, Activity } from "lucide-react";
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
import { BloodGroup } from "@/types/patient.types";
import { BloodGroupValues } from "@/zod/patient.validation";

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

interface BiometricsSectionProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    fieldErrors?: Record<string, string>;
}

const extractNumber = (val: string): number | null => {
    if (!val) return null;
    const match = val.match(/[\d.]+/);
    if (!match) return null;
    const n = parseFloat(match[0]);
    return isNaN(n) ? null : n;
};

export default function HealthRecordsBiometricsSection({
    form,
    fieldErrors = {},
}: BiometricsSectionProps) {
    const heightVal = form.getFieldValue("height") || "";
    const weightVal = form.getFieldValue("weight") || "";

    const hNum = extractNumber(heightVal);
    const wNum = extractNumber(weightVal);

    let bmiInfo: { value: string; label: string; colorClass: string } | null = null;
    if (hNum && wNum && hNum > 50 && hNum < 300 && wNum > 10 && wNum < 500) {
        const heightMeters = hNum / 100;
        const bmi = wNum / (heightMeters * heightMeters);
        const bmiStr = bmi.toFixed(1);

        if (bmi < 18.5) {
            bmiInfo = {
                value: bmiStr,
                label: "Underweight",
                colorClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900",
            };
        } else if (bmi < 25.0) {
            bmiInfo = {
                value: bmiStr,
                label: "Normal weight",
                colorClass: "bg-secondary/10 text-secondary border-secondary/20",
            };
        } else if (bmi < 30.0) {
            bmiInfo = {
                value: bmiStr,
                label: "Overweight",
                colorClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
            };
        } else {
            bmiInfo = {
                value: bmiStr,
                label: "Obese",
                colorClass: "bg-destructive/10 text-destructive border-destructive/20",
            };
        }
    }

    return (
        <Card className="border-border bg-card text-card-foreground shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <HeartPulse className="size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-foreground">
                                Biometrics & Vitals
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Blood group, body measurements, and physical vital signs
                            </CardDescription>
                        </div>
                    </div>

                    {bmiInfo && (
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tabular-nums shadow-2xs ${bmiInfo.colorClass}`}>
                            <Activity className="size-3.5" />
                            <span>BMI: {bmiInfo.value}</span>
                            <span className="text-muted-foreground font-normal">({bmiInfo.label})</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Blood Group */}
                <form.Field name="bloodGroup">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => {
                        const hasError = Boolean(fieldErrors.bloodGroup);
                        return (
                            <div className="space-y-1.5">
                                <Label htmlFor="bloodGroup" className="text-xs font-medium text-foreground">
                                    Blood Group <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(val) => field.handleChange(val as BloodGroup)}
                                >
                                    <SelectTrigger
                                        id="bloodGroup"
                                        aria-invalid={hasError}
                                        className={`w-full ${hasError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                    >
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
                                {hasError && (
                                    <p className="text-xs text-destructive mt-1">{fieldErrors.bloodGroup}</p>
                                )}
                            </div>
                        );
                    }}
                </form.Field>

                {/* Height */}
                <form.Field name="height">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => {
                        const hasError = Boolean(fieldErrors.height);
                        return (
                            <div className="space-y-1.5">
                                <Label htmlFor="height" className="text-xs font-medium text-foreground">
                                    Height (cm) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="height"
                                    type="text"
                                    placeholder="e.g. 175 cm"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    aria-invalid={hasError}
                                    className={`w-full tabular-nums ${hasError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                />
                                {hasError && (
                                    <p className="text-xs text-destructive mt-1">{fieldErrors.height}</p>
                                )}
                            </div>
                        );
                    }}
                </form.Field>

                {/* Weight */}
                <form.Field name="weight">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => {
                        const hasError = Boolean(fieldErrors.weight);
                        return (
                            <div className="space-y-1.5">
                                <Label htmlFor="weight" className="text-xs font-medium text-foreground">
                                    Weight (kg) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="weight"
                                    type="text"
                                    placeholder="e.g. 70 kg"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    aria-invalid={hasError}
                                    className={`w-full tabular-nums ${hasError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                />
                                {hasError && (
                                    <p className="text-xs text-destructive mt-1">{fieldErrors.weight}</p>
                                )}
                            </div>
                        );
                    }}
                </form.Field>
            </CardContent>
        </Card>
    );
}
