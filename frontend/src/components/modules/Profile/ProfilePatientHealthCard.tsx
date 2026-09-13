import React from "react";
import Link from "next/link";
import { ArrowUpRight, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IPatientProfile } from "@/types/user.types";

interface ProfilePatientHealthCardProps {
    patientData?: IPatientProfile | null;
}

export default function ProfilePatientHealthCard({ patientData }: ProfilePatientHealthCardProps) {
    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground">
                        <HeartPulse className="size-5 text-[#178A5E]" />
                        <CardTitle className="text-lg font-semibold">
                            Health Overview
                        </CardTitle>
                    </div>
                    <Link href="/dashboard/health-records">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary font-medium hover:text-primary hover:bg-primary/5"
                        >
                            Health Records
                            <ArrowUpRight className="size-3.5 ml-1" />
                        </Button>
                    </Link>
                </div>
                <CardDescription>
                    Clinical metrics recorded on your profile.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Gender
                        </span>
                        <p className="font-medium capitalize text-foreground">
                            {patientData?.patientHealthData?.gender?.toLowerCase() ||
                                "Not specified"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Blood Group
                        </span>
                        <p className="font-medium text-foreground">
                            {patientData?.patientHealthData?.bloodGroup?.replace(
                                "_",
                                " "
                            ) || "Not specified"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Date of Birth
                        </span>
                        <p className="font-medium text-foreground">
                            {patientData?.patientHealthData?.dateOfBirth
                                ? new Date(
                                      patientData.patientHealthData.dateOfBirth
                                  ).toLocaleDateString()
                                : "Not specified"}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
