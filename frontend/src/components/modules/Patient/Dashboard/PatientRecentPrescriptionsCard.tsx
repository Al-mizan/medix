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
        <Card className="lg:col-span-2 border-[#E3E6EB] bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#E3E6EB]">
                <div>
                    <CardTitle className="text-base font-semibold text-[#101828] flex items-center gap-2">
                        <Pill className="size-4 text-[#0B7285]" />
                        Recent Prescriptions
                    </CardTitle>
                    <CardDescription className="text-xs text-[#5B6472]">
                        Medical orders and dosage instructions from your consultations
                    </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-[#0B7285] hover:text-[#095E70]">
                    <Link href="/dashboard/my-prescriptions">
                        View all <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                {recentPrescriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="size-12 rounded-full bg-[#E1F3F6] flex items-center justify-center text-[#0B7285] mb-3">
                            <FileText className="size-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-[#101828]">
                            No prescriptions found
                        </h3>
                        <p className="text-xs text-[#5B6472] max-w-sm mt-1">
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
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#E3E6EB] hover:border-[#0B7285]/40 transition-colors bg-white shadow-2xs"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-[#101828]">
                                                Dr. {doctorName}
                                            </h4>
                                            <span className="text-[11px] text-[#5B6472]">• {formattedDate}</span>
                                        </div>
                                        <p className="text-xs text-[#5B6472] line-clamp-2">
                                            {rx.instructions || "Standard clinical medication guidance issued."}
                                        </p>
                                        {followUp && (
                                            <p className="text-[11px] font-medium text-[#0B7285]">
                                                Follow-up date: {followUp}
                                            </p>
                                        )}
                                    </div>

                                    <div className="self-end sm:self-center">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="text-xs font-medium border-[#0B7285] text-[#0B7285] hover:bg-[#E1F3F6]"
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
