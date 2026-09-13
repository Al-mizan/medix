import React from "react";
import { Shield } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserRole } from "@/lib/authUtils";

interface ProfileAdminScopeCardProps {
    role: UserRole;
}

export default function ProfileAdminScopeCard({ role }: ProfileAdminScopeCardProps) {
    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-foreground">
                    <Shield className="size-5 text-[#0B7285]" />
                    <CardTitle className="text-lg font-semibold">
                        Administrative Scope
                    </CardTitle>
                </div>
                <CardDescription>
                    System access tier and administrative permissions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Privilege Level
                        </span>
                        <p className="font-medium text-foreground">
                            {role === "SUPER_ADMIN"
                                ? "Super Administrator (Full System Access)"
                                : "System Administrator"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Hospital Management
                        </span>
                        <p className="font-medium text-foreground">
                            Doctors, Patients, Appointments, Schedules
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
