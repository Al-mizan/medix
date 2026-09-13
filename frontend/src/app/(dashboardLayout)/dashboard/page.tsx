import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDashboardData } from "@/services/dashboard.services";
import { getMyAppointments } from "@/services/appointment.services";
import { getMyPrescriptions } from "@/services/prescription.services";
import { getMyPatientProfile } from "@/services/patient.services";
import PatientDashboardContent from "@/components/modules/Patient/Dashboard/PatientDashboardContent";

export const metadata = {
    title: "Patient Dashboard | Medix Digital Healthcare",
    description: "Overview of your medical consultations, prescriptions, and health records.",
};

export default async function PatientDashboardPage() {
    const queryClient = new QueryClient();

    await Promise.allSettled([
        queryClient.prefetchQuery({
            queryKey: ["patient-dashboard-stats"],
            queryFn: () => getDashboardData(),
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
            queryKey: ["my-appointments"],
            queryFn: () => getMyAppointments(),
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
            queryKey: ["my-prescriptions"],
            queryFn: () => getMyPrescriptions(),
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
            queryKey: ["my-patient-profile"],
            queryFn: () => getMyPatientProfile(),
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PatientDashboardContent />
        </HydrationBoundary>
    );
}
