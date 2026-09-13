import React from "react";
import { Mail, MapPin, Phone, User } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserInfo } from "@/types/user.types";

interface ProfilePersonalInfoCardProps {
    user: UserInfo;
}

export default function ProfilePersonalInfoCard({ user }: ProfilePersonalInfoCardProps) {
    const patientData = user.patient;
    const doctorData = user.doctor;
    const adminData = user.admin;

    const contactNumber =
        patientData?.contactNumber ||
        doctorData?.contactNumber ||
        adminData?.contactNumber ||
        "Not provided";

    const address =
        patientData?.address ||
        doctorData?.address ||
        "Not provided";

    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-foreground">
                    <User className="size-5 text-[#0B7285]" />
                    <CardTitle className="text-lg font-semibold">
                        Personal Information
                    </CardTitle>
                </div>
                <CardDescription>
                    Your basic account details and primary contact information.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <User className="size-3.5" /> Full Name
                        </span>
                        <p className="font-medium text-foreground">{user.name}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Mail className="size-3.5" /> Email Address
                        </span>
                        <p className="font-medium text-foreground">{user.email}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Phone className="size-3.5" /> Contact Number
                        </span>
                        <p className="font-medium text-foreground">{contactNumber}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="size-3.5" /> Address
                        </span>
                        <p className="font-medium text-foreground">{address}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
