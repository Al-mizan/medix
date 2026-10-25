import { format } from "date-fns";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HealthRecordsDemographicsSection({ form }: { form: any }) {
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
                            Personal identity, biological sex, and birth date details
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Gender */}
                <form.Field name="gender">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
                        <div className="space-y-1.5">
                            <Label htmlFor="gender" className="text-xs font-medium text-foreground">
                                Gender <span className="text-destructive">*</span>
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
                        <div className="space-y-1.5">
                            <Label htmlFor="dateOfBirth" className="text-xs font-medium text-foreground">
                                Date of Birth <span className="text-destructive">*</span>
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
