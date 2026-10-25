import { Stethoscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HealthRecordsLifestyleSection({ form }: { form: any }) {
    return (
        <Card className="border-border bg-card text-card-foreground shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Stethoscope className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                            Lifestyle & Clinical History
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
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
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(field: any) => (
                            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30 text-card-foreground shadow-2xs">
                                <div className="space-y-0.5 pr-2">
                                    <Label htmlFor="smokingStatus" className="text-xs font-semibold text-foreground cursor-pointer">
                                        Smoker
                                    </Label>
                                    <p className="text-[11px] text-muted-foreground">Tobacco or vape</p>
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
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(field: any) => (
                            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30 text-card-foreground shadow-2xs">
                                <div className="space-y-0.5 pr-2">
                                    <Label htmlFor="pregnancyStatus" className="text-xs font-semibold text-foreground cursor-pointer">
                                        Pregnant
                                    </Label>
                                    <p className="text-[11px] text-muted-foreground">Currently expecting</p>
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
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(field: any) => (
                            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30 text-card-foreground shadow-2xs">
                                <div className="space-y-0.5 pr-2">
                                    <Label htmlFor="recentAnxiety" className="text-xs font-semibold text-foreground cursor-pointer">
                                        Recent Anxiety
                                    </Label>
                                    <p className="text-[11px] text-muted-foreground">Past 6 months</p>
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
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(field: any) => (
                            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30 text-card-foreground shadow-2xs">
                                <div className="space-y-0.5 pr-2">
                                    <Label htmlFor="recentDepression" className="text-xs font-semibold text-foreground cursor-pointer">
                                        Recent Depression
                                    </Label>
                                    <p className="text-[11px] text-muted-foreground">Persistent low mood</p>
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
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(field: any) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="dietaryPreferences" className="text-xs font-medium text-foreground">
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
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(field: any) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="immunizationStatus" className="text-xs font-medium text-foreground">
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
                        <div className="space-y-1.5">
                            <Label htmlFor="mentalHealthHistory" className="text-xs font-medium text-foreground">
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
    );
}
