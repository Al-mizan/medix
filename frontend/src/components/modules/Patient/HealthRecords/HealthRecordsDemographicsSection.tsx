import { format, differenceInYears } from "date-fns";
import { User } from "lucide-react";
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
import { Gender } from "@/types/patient.types";
import { GenderValues } from "@/zod/patient.validation";

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

interface DemographicsSectionProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    fieldErrors?: Record<string, string>;
}

export default function HealthRecordsDemographicsSection({
    form,
    fieldErrors = {},
}: DemographicsSectionProps) {
    const calculateAge = (dobString?: string): number | null => {
        if (!dobString) return null;
        try {
            const date = new Date(dobString);
            if (isNaN(date.getTime())) return null;
            const age = differenceInYears(new Date(), date);
            return age >= 0 ? age : null;
        } catch {
            return null;
        }
    };

    return (
        <Card className="border-border bg-card text-card-foreground shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <User className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                            Demographics
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Personal identity, biological sex, and verified date of birth
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Gender */}
                <form.Field name="gender">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => {
                        const hasError = Boolean(fieldErrors.gender);
                        return (
                            <div className="space-y-1.5">
                                <Label htmlFor="gender" className="text-xs font-medium text-foreground">
                                    Gender <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(val) => field.handleChange(val as Gender)}
                                >
                                    <SelectTrigger
                                        id="gender"
                                        aria-invalid={hasError}
                                        className={`w-full ${hasError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                    >
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
                                {hasError && (
                                    <p className="text-xs text-destructive mt-1">{fieldErrors.gender}</p>
                                )}
                            </div>
                        );
                    }}
                </form.Field>

                {/* Date of Birth */}
                <form.Field name="dateOfBirth">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => {
                        const hasError = Boolean(fieldErrors.dateOfBirth);
                        const computedAge = calculateAge(field.state.value);
                        return (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="dateOfBirth" className="text-xs font-medium text-foreground">
                                        Date of Birth <span className="text-destructive">*</span>
                                    </Label>
                                    {computedAge !== null && (
                                        <span className="text-xs font-semibold tabular-nums text-secondary">
                                            {computedAge} yrs
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    max={format(new Date(), "yyyy-MM-dd")}
                                    aria-invalid={hasError}
                                    className={`w-full tabular-nums ${hasError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                />
                                {hasError && (
                                    <p className="text-xs text-destructive mt-1">{fieldErrors.dateOfBirth}</p>
                                )}
                            </div>
                        );
                    }}
                </form.Field>

                {/* Marital Status */}
                <form.Field name="maritalStatus">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
                        <div className="space-y-1.5">
                            <Label htmlFor="maritalStatus" className="text-xs font-medium text-foreground">
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
    );
}
