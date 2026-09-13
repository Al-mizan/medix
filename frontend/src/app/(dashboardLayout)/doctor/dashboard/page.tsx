import type { Metadata } from "next";
import DoctorDashboardContent from "@/components/modules/Doctor/Dashboard/DoctorDashboardContent"
import { getMyAppointments } from "@/services/appointment.services"
import { getDoctorDashboardData } from "@/services/dashboard.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Clinician Workspace & Appointments",
  description:
    "Manage clinical consultations, upcoming patient appointments, and issued prescriptions.",
};

const DoctorDashboardPage = async () => {
  const queryClient = new QueryClient()

  // SSR prefetch dashboard stats and doctor appointments
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["doctor-dashboard-data"],
      queryFn: getDoctorDashboardData,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["my-appointments"],
      queryFn: () => getMyAppointments(),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DoctorDashboardContent />
      </section>
    </HydrationBoundary>
  )
}

export default DoctorDashboardPage
