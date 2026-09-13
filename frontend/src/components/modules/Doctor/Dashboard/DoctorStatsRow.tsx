import StatsCard from "@/components/shared/StatsCard";
import { IDoctorDashboardData } from "@/types/dashboard.types";

interface DoctorStatsRowProps {
  stats?: IDoctorDashboardData;
}

export default function DoctorStatsRow({ stats }: DoctorStatsRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Appointments"
        value={stats?.appointmentCount ?? 0}
        iconName="Calendar"
        description="All recorded bookings"
        className="border-neutral-200 shadow-sm dark:border-neutral-800"
      />
      <StatsCard
        title="Patients Treated"
        value={stats?.patientCount ?? 0}
        iconName="Users"
        description="Unique patients consulted"
        className="border-neutral-200 shadow-sm dark:border-neutral-800"
      />
      <StatsCard
        title="Patient Reviews"
        value={stats?.reviewCount ?? 0}
        iconName="Star"
        description="Total patient feedbacks received"
        className="border-neutral-200 shadow-sm dark:border-neutral-800"
      />
      <StatsCard
        title="Total Revenue"
        value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`}
        iconName="DollarSign"
        description="Earnings from completed consultations"
        className="border-neutral-200 shadow-sm dark:border-neutral-800"
      />
    </div>
  );
}
