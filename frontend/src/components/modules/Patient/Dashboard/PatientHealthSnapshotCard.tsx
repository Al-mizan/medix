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
        <Card className="border-[#E3E6EB] bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-[#E3E6EB]">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-[#101828] flex items-center gap-2">
                        <HeartPulse className="size-4 text-[#0B7285]" />
                        Health Summary
                    </CardTitle>
                    <Button asChild variant="ghost" size="sm" className="text-xs text-[#0B7285] hover:text-[#095E70]">
                        <Link href="/dashboard/health-records">
                            Edit <ArrowRight className="size-3.5 ml-1" />
                        </Link>
                    </Button>
                </div>
                <CardDescription className="text-xs text-[#5B6472]">
                    Key biometrics and health data snapshot
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
                {healthData ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-[#E3E6EB] bg-[#F7F8FA]">
                                <span className="text-[11px] text-[#5B6472] uppercase font-semibold">
                                    Blood Group
                                </span>
                                <p className="text-lg font-bold text-[#0B7285] mt-0.5">
                                    {formatBloodGroup(healthData.bloodGroup)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border border-[#E3E6EB] bg-[#F7F8FA]">
                                <span className="text-[11px] text-[#5B6472] uppercase font-semibold">
                                    Allergies
                                </span>
                                <div className="mt-1">
                                    {healthData.hasAllergies ? (
                                        <Badge className="bg-[#FCEBEB] text-[#7A2323] border-transparent text-[11px]">
                                            Has Allergies
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-[#E3F7EE] text-[#0F5C3E] border-transparent text-[11px]">
                                            None Reported
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5 pt-1 text-xs">
                            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                <span className="text-[#5B6472]">Height:</span>
                                <span className="font-semibold text-[#101828]">
                                    {healthData.height ? `${healthData.height} cm` : "Not recorded"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                <span className="text-[#5B6472]">Weight:</span>
                                <span className="font-semibold text-[#101828]">
                                    {healthData.weight ? `${healthData.weight} kg` : "Not recorded"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                <span className="text-[#5B6472]">Diabetes Status:</span>
                                <span className="font-semibold text-[#101828]">
                                    {healthData.hasDiabetes ? (
                                        <span className="text-[#E3A130]">Diagnosed</span>
                                    ) : (
                                        <span className="text-[#178A5E]">No</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-[#5B6472]">Smoking Status:</span>
                                <span className="font-semibold text-[#101828]">
                                    {healthData.smokingStatus ? (
                                        <span className="text-[#D8464B]">Smoker</span>
                                    ) : (
                                        <span className="text-[#178A5E]">Non-smoker</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full text-xs font-medium border-[#0B7285] text-[#0B7285] hover:bg-[#E1F3F6]"
                        >
                            <Link href="/dashboard/health-records">
                                Update Health Records
                            </Link>
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <div className="size-10 rounded-full bg-[#FBF0DC] flex items-center justify-center text-[#7A4A09]">
                            <AlertTriangle className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-[#101828]">
                                Health Profile Incomplete
                            </h4>
                            <p className="text-[11px] text-[#5B6472] mt-1">
                                Providing your vitals and allergies helps doctors deliver safer, tailored care.
                            </p>
                        </div>
                        <Button
                            asChild
                            size="sm"
                            className="bg-[#D9542E] hover:bg-[#B8431F] text-white text-xs font-medium w-full"
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
