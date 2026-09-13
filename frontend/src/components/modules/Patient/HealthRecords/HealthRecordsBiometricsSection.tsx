import { HeartPulse } from "lucide-react";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HealthRecordsBiometricsSection({ form }: { form: any }) {
    return (
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
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
    );
}
