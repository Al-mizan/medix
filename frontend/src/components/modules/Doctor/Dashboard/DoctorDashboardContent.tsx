"use client";

import { useQuery } from "@tanstack/react-query";
import { isToday } from "date-fns";
import { getMyAppointments } from "@/services/appointment.services";
import { getDoctorDashboardData } from "@/services/dashboard.services";
import { ApiResponse } from "@/types/api.types";
import { IAppointment } from "@/types/appointment.types";
import dynamic from "next/dynamic";
import { IDoctorDashboardData } from "@/types/dashboard.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DoctorStatsRow from "./DoctorStatsRow";
import DoctorTodayAppointmentsList from "./DoctorTodayAppointmentsList";
import DoctorPrescriptionBanner from "./DoctorPrescriptionBanner";
import DashboardStatsSkeleton from "@/components/modules/DashboardStatsSkeleton";

const DoctorAppointmentStatusDonut = dynamic(
  () => import("./DoctorAppointmentStatusDonut"),
  {
    ssr: false,
    loading: () => (
      <Card className="border-neutral-200 shadow-sm lg:col-span-3 dark:border-neutral-800">
        <CardHeader className="pb-2 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Skeleton className="h-60 w-60 rounded-full" />
        </CardContent>
      </Card>
    ),
  }
);

const DoctorDashboardContent = () => {
  const { data: statsResponse, isLoading: isStatsLoading } = useQuery({
    queryKey: ["doctor-dashboard-data"],
    queryFn: getDoctorDashboardData,
    refetchOnWindowFocus: "always",
  });

  const { data: appointmentsResponse, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => getMyAppointments(),
    refetchOnWindowFocus: "always",
  });

  if (isStatsLoading && isAppointmentsLoading) {
    return <DashboardStatsSkeleton />;
  }

  const stats = (statsResponse as ApiResponse<IDoctorDashboardData>)?.data;
  const appointments =
    (appointmentsResponse as ApiResponse<IAppointment[]>)?.data ?? [];

  // Filter today's appointments
  const todayAppointments = appointments
    .filter((apt) => {
      if (!apt.schedule?.startDateTime) return false;
      const startDate = new Date(apt.schedule.startDateTime);
      return !Number.isNaN(startDate.getTime()) && isToday(startDate);
    })
    .sort((a, b) => {
      const timeA = new Date(a.schedule?.startDateTime ?? 0).getTime();
      const timeB = new Date(b.schedule?.startDateTime ?? 0).getTime();
      return timeA - timeB;
    });

  return (
    <div className="space-y-6">
      {/* Top 4 Metric Overview Cards */}
      <DoctorStatsRow stats={stats} />

      {/* Main Grid: Today's Appointments & Distribution Chart */}
      <div className="grid gap-6 lg:grid-cols-7">
        <DoctorTodayAppointmentsList todayAppointments={todayAppointments} />
        <DoctorAppointmentStatusDonut
          distribution={stats?.appointmentStatusDistribution}
        />
      </div>

      {/* Quick Navigation Footer Banner */}
      <DoctorPrescriptionBanner />
    </div>
  );
};

export default DoctorDashboardContent;
