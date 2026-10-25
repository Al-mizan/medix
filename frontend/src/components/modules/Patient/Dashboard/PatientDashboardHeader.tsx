import Link from "next/link";
import { Activity, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientDashboardHeaderProps {
    name?: string | null;
}

export default function PatientDashboardHeader({ name }: PatientDashboardHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                    <Activity className="size-3.5 text-primary" /> Patient Portal
                </span>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Welcome back, {name || "Patient"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review your upcoming consultations, prescriptions, and health profile status.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    asChild
                    className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium shadow-xs"
                >
                    <Link href="/dashboard/book-appointments">
                        <CalendarPlus className="size-4 mr-2" /> Book Appointment
                    </Link>
                </Button>
            </div>
        </div>
    );
}
