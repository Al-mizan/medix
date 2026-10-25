import Link from "next/link";
import { AlertTriangle, ArrowRight, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IPatientHealthData } from "@/types/patient.types";

const formatBloodGroup = (bg?: string | null) => {
    if (!bg) return "Not specified";
    return bg
        .replace("_POSITIVE", "+")
        .replace("_NEGATIVE", "-");
};

interface PatientHealthSnapshotCardProps {
    healthData?: IPatientHealthData | null;
}

export default function PatientHealthSnapshotCard({
    healthData,
}: PatientHealthSnapshotCardProps) {
    return (
        <Card className="border-border bg-card text-card-foreground shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <HeartPulse className="size-4 text-primary" />
                    Health Summary
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Key biometrics and health data snapshot
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
                {healthData ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-border bg-muted/30">
                                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                                    Blood Group
                                </span>
                                <p className="text-lg font-bold text-primary mt-0.5">
                                    {formatBloodGroup(healthData.bloodGroup)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border border-border bg-muted/30">
                                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                                    Allergies
                                </span>
                                <div className="mt-1">
                                    {healthData.hasAllergies ? (
                                        <Badge className="bg-destructive/15 text-destructive border-transparent text-[11px]">
                                            Has Allergies
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-secondary/15 text-secondary border-transparent text-[11px]">
                                            None Reported
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5 pt-1 text-xs">
                            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                <span className="text-muted-foreground">Height:</span>
                                <span className="font-semibold text-foreground">
                                    {healthData.height ? `${healthData.height} cm` : "Not recorded"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                <span className="text-muted-foreground">Weight:</span>
                                <span className="font-semibold text-foreground">
                                    {healthData.weight ? `${healthData.weight} kg` : "Not recorded"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                <span className="text-muted-foreground">Diabetes Status:</span>
                                <span className="font-semibold text-foreground">
                                    {healthData.hasDiabetes ? (
                                        <span className="text-warning">Diagnosed</span>
                                    ) : (
                                        <span className="text-secondary">No</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-muted-foreground">Smoking Status:</span>
                                <span className="font-semibold text-foreground">
                                    {healthData.smokingStatus ? (
                                        <span className="text-destructive">Smoker</span>
                                    ) : (
                                        <span className="text-secondary">Non-smoker</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full text-xs font-medium border-primary text-primary hover:bg-primary/10"
                        >
                            <Link href="/dashboard/health-records">
                                Update Health Records
                            </Link>
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-foreground">
                                Health Profile Incomplete
                            </h4>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Providing your vitals and allergies helps doctors deliver safer, tailored care.
                            </p>
                        </div>
                        <Button
                            asChild
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-medium w-full"
                        >
                            <Link href="/dashboard/health-records">
                                Complete Health Profile
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
