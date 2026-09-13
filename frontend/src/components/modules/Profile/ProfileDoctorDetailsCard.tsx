import React from "react";
import { Building, DollarSign, Star, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IDoctorProfile } from "@/types/user.types";

interface ProfileDoctorDetailsCardProps {
    doctorData: IDoctorProfile;
}

export default function ProfileDoctorDetailsCard({ doctorData }: ProfileDoctorDetailsCardProps) {
    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-foreground">
                    <Stethoscope className="size-5 text-[#0B7285]" />
                    <CardTitle className="text-lg font-semibold">
                        Clinical & Professional Details
                    </CardTitle>
                </div>
                <CardDescription>
                    Verification credentials, specialties, and hospital affiliations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
                {/* Specialties */}
                <div>
                    <span className="text-xs font-medium text-muted-foreground block mb-2">
                        Clinical Specialties
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {doctorData.specialties && doctorData.specialties.length > 0 ? (
                            doctorData.specialties.map((s, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-[#E1F3F6] text-[#075463] border-transparent font-medium"
                                >
                                    {s.specialty?.title || "Specialty"}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground text-xs">
                                No specialties listed
                            </span>
                        )}
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Designation & Qualification
                        </span>
                        <p className="font-medium text-foreground">
                            {doctorData.designation || "Doctor"} (
                            {doctorData.qualification || "MBBS"})
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Building className="size-3.5" /> Current Workplace
                        </span>
                        <p className="font-medium text-foreground">
                            {doctorData.currentWorkingPlace || "Not specified"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Registration License
                        </span>
                        <p className="font-medium text-foreground font-mono text-xs">
                            {doctorData.registrationNumber || "Not specified"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <DollarSign className="size-3.5" /> Consultation Fee
                        </span>
                        <p className="font-medium text-foreground">
                            ${doctorData.appointmentFee ?? 0}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Experience
                        </span>
                        <p className="font-medium text-foreground">
                            {doctorData.experience ?? 0} years
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Star className="size-3.5 text-amber-500 fill-amber-500" /> Patient Rating
                        </span>
                        <p className="font-medium text-foreground">
                            {doctorData.averageRating
                                ? Number(doctorData.averageRating).toFixed(1)
                                : "5.0"}{" "}
                            / 5.0
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
