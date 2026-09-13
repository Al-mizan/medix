import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HealthRecordsChronicConditionsSection({ form }: { form: any }) {
    return (
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
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
    );
}
