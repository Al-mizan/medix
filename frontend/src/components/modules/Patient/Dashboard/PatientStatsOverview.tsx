import StatsCard from "@/components/shared/StatsCard";

interface PatientStatsOverviewProps {
    totalAppointments: number;
    upcomingAppointmentsCount: number;
    completedAppointmentsCount: number;
    totalPrescriptions: number;
}

export default function PatientStatsOverview({
    totalAppointments,
    upcomingAppointmentsCount,
    completedAppointmentsCount,
    totalPrescriptions,
}: PatientStatsOverviewProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                title="Total Appointments"
                value={totalAppointments}
                iconName="Calendar"
                description="Lifetime booking history"
                className="border-[#E3E6EB] bg-white shadow-xs"
            />
            <StatsCard
                title="Upcoming Appointments"
                value={upcomingAppointmentsCount}
                iconName="Clock"
                description="Scheduled visits"
                className="border-[#E3E6EB] bg-white shadow-xs"
            />
            <StatsCard
                title="Completed Visits"
                value={completedAppointmentsCount}
                iconName="CheckCircle"
                description="Consultations finished"
                className="border-[#E3E6EB] bg-white shadow-xs"
            />
            <StatsCard
                title="Prescriptions"
                value={totalPrescriptions}
                iconName="FileText"
                description="Active & past prescriptions"
                className="border-[#E3E6EB] bg-white shadow-xs"
            />
        </div>
    );
}
