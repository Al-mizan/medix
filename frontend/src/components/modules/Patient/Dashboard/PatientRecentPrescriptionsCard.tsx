import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, FileText, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IPrescription } from "@/types/prescription.types";

interface PatientRecentPrescriptionsCardProps {
    recentPrescriptions: IPrescription[];
}

export default function PatientRecentPrescriptionsCard({
    recentPrescriptions,
}: PatientRecentPrescriptionsCardProps) {
    return (
        <Card className="lg:col-span-2 border-border bg-card text-card-foreground shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
                <div>
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Pill className="size-4 text-primary" />
                        Recent Prescriptions
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        Medical orders and dosage instructions from your consultations
                    </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/90">
                    <Link href="/dashboard/my-prescriptions">
                        View all <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                {recentPrescriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                            <FileText className="size-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                            No prescriptions found
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1">
                            Prescriptions issued by doctors after completed visits will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {recentPrescriptions.map((rx) => {
                            const doctorName = rx.doctor?.name || "Doctor";
                            const formattedDate = format(new Date(rx.createdAt), "MMM dd, yyyy");
                            const followUp = rx.followUpDate
                                ? format(new Date(rx.followUpDate), "MMM dd, yyyy")
                                : null;

                            return (
                                <div
                                    key={rx.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border hover:border-primary/40 transition-colors bg-card shadow-2xs"
                                >
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <h4 className="text-sm font-semibold text-foreground truncate" title={`Dr. ${doctorName}`}>
                                                Dr. {doctorName}
                                            </h4>
                                            <span className="text-[11px] text-muted-foreground shrink-0">• {formattedDate}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2" title={rx.instructions || undefined}>
                                            {rx.instructions || "Standard clinical medication guidance issued."}
                                        </p>
                                        {followUp && (
                                            <p className="text-[11px] font-medium text-primary">
                                                Follow-up date: {followUp}
                                            </p>
                                        )}
                                    </div>

                                    <div className="self-end sm:self-center shrink-0">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="text-xs font-medium border-primary/30 text-primary hover:bg-primary/10"
                                        >
                                            <Link href="/dashboard/my-prescriptions">
                                                View Details
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
