"use client"

import dynamic from "next/dynamic";
import StatsCard from "@/components/shared/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDashboardData } from "@/services/dashboard.services";
import { ApiResponse } from "@/types/api.types";
import { IAdminDashboardData } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import DashboardStatsSkeleton from "@/components/modules/DashboardStatsSkeleton";

const AppointmentBarChart = dynamic(
  () => import("@/components/shared/AppointmentBarChart"),
  {
    ssr: false,
    loading: () => (
      <Card className="col-span-4 border-neutral-200">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full rounded-lg" />
        </CardContent>
      </Card>
    ),
  }
);

const AppointmentPieChart = dynamic(
  () => import("@/components/shared/AppointmentPieChart"),
  {
    ssr: false,
    loading: () => (
      <Card className="col-span-2 border-neutral-200">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-[300px] w-[300px] rounded-full" />
        </CardContent>
      </Card>
    ),
  }
);

const AdminDashboardContent = () => {
  const { data: adminDashboardData, isLoading } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
    refetchOnWindowFocus: "always", // Refetch the data when the window regains focus
  });

  if (isLoading) {
    return <DashboardStatsSkeleton />;
  }

  const data = (adminDashboardData as ApiResponse<IAdminDashboardData>)?.data;
  //http://localhost:5000/api/v1/doctors?page=1&limit=2&searchTerm=ortho&appointmentFee[gt]=1000&appointmentFee[lte]=1500&fields=name,email&sortBy=user.name.firstName&sortOrder=asc&experience[gt]=7&include=specialties&user.role=DOCTOR&specialties.specialty.title=Neurology&gender=MALE&specialties.specialty.title=Cardiology2
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Appointments"
          value={data?.appointmentCount || 0}
          iconName="CalendarDays"
          description="Number of appointments scheduled"
        />
        <StatsCard
          title="Total Patients"
          value={data?.patientCount || 0}
          iconName="Users"
          description="Number of patients registered"
        />
        <StatsCard
          title="Total Doctors"
          value={data?.doctorCount || 0}
          iconName="Stethoscope"
          description="Active doctors registered"
        />
        <StatsCard
          title="Total Revenue"
          value={
            data?.totalRevenue !== undefined
              ? `$${data.totalRevenue.toLocaleString()}`
              : "$0"
          }
          iconName="CreditCard"
          description="Total platform revenue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-6">
        <AppointmentBarChart data={data?.barChartData || []} />
        <AppointmentPieChart data={data?.pieChartData || []} />
      </div>
    </div>
  );
}

export default AdminDashboardContent