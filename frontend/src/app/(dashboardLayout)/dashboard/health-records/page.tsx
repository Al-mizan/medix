import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getMyPatientProfile } from "@/services/patient.services";
import HealthRecordsClient from "./HealthRecordsClient";

export const metadata = {
    title: "Health Records | Medix Digital Healthcare",
    description: "Manage your personal health data, vitals, and medical profile.",
};

export default async function HealthRecordsPage() {
    const queryClient = new QueryClient();

    try {
        await queryClient.prefetchQuery({
            queryKey: ["my-patient-profile"],
            queryFn: getMyPatientProfile,
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
        });
    } catch (error) {
        console.error("Failed to prefetch patient profile:", error);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HealthRecordsClient />
        </HydrationBoundary>
    );
}
