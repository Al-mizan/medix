import DoctorSpecialtiesOverview from "@/components/modules/Admin/DoctorSpecialtiesManagement/DoctorSpecialtiesOverview";
import { getDoctors } from "@/services/doctor.services";
import { getSpecialties } from "@/services/specialty.services";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

const DoctorSpecialtiesManagementPage = async () => {
    const queryClient = new QueryClient();

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ["doctors-specialties-overview"],
            queryFn: () => getDoctors("limit=100"),
            staleTime: 1000 * 60 * 5,
        }),
        queryClient.prefetchQuery({
            queryKey: ["specialties-list-overview"],
            queryFn: () => getSpecialties("limit=100"),
            staleTime: 1000 * 60 * 5,
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DoctorSpecialtiesOverview />
        </HydrationBoundary>
    );
};

export default DoctorSpecialtiesManagementPage;