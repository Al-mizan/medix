import React from "react";
import { Building, DollarSign, Lock, Stethoscope } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { IDoctorProfile } from "@/types/user.types";

interface ProfileClinicalCredentialsCardProps {
    doctorData: IDoctorProfile;
}

export default function ProfileClinicalCredentialsCard({ doctorData }: ProfileClinicalCredentialsCardProps) {
    return (
        <div className="pt-4 space-y-4">
            <Separator />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Stethoscope className="size-4 text-[#0B7285]" />
                    <h4 className="text-sm font-semibold text-foreground">
                        Clinical Credentials (Read-Only)
                    </h4>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3" />
                    <span>Managed by Hospital Admin</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-muted-foreground">Designation</span>
                    <p className="font-medium text-foreground">
                        {doctorData.designation || "Doctor"}
                    </p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-muted-foreground">Qualification</span>
                    <p className="font-medium text-foreground">
                        {doctorData.qualification || "MBBS"}
                    </p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Building className="size-3" /> Workplace
                    </span>
                    <p className="font-medium text-foreground">
                        {doctorData.currentWorkingPlace || "Not specified"}
                    </p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-muted-foreground">License No.</span>
                    <p className="font-medium font-mono text-foreground">
                        {doctorData.registrationNumber || "Not specified"}
                    </p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="size-3" /> Consultation Fee
                    </span>
                    <p className="font-medium text-foreground">
                        ${doctorData.appointmentFee ?? 0}
                    </p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-muted-foreground">Experience</span>
                    <p className="font-medium text-foreground">
                        {doctorData.experience ?? 0} years
                    </p>
                </div>
            </div>
        </div>
    );
}
