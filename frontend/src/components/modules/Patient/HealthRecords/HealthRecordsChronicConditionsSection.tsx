import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HealthRecordsChronicConditionsSection({ form }: { form: any }) {
    return (
        <Card className="border-border bg-card text-card-foreground shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <ShieldAlert className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                            Chronic Conditions & Allergies
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
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
                        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30 text-card-foreground shadow-2xs">
                            <div className="space-y-0.5 pr-2">
                                <Label htmlFor="hasAllergies" className="text-xs font-semibold text-foreground cursor-pointer">
                                    Allergies
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
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
                        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30 text-card-foreground shadow-2xs">
                            <div className="space-y-0.5 pr-2">
                                <Label htmlFor="hasDiabetes" className="text-xs font-semibold text-foreground cursor-pointer">
                                    Diabetes
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
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
                        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30 text-card-foreground shadow-2xs">
                            <div className="space-y-0.5 pr-2">
                                <Label htmlFor="hasPastSurgeries" className="text-xs font-semibold text-foreground cursor-pointer">
                                    Past Surgeries
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
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
