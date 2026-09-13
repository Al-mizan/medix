import DoctorSchedulesTable from "@/components/modules/Admin/DoctorSchedulesManagement/DoctorSchedulesTable";
import { getAllDoctorSchedules } from "@/services/doctorSchedule.services";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const DoctorSchedulesManagementPage = async ({ searchParams }: PageProps) => {
    const queryParamsObjects = await searchParams;

    const queryString = Object.keys(queryParamsObjects)
        .map((key) => {
            const value = queryParamsObjects[key];
            if (value === undefined) {
                return "";
            }

            if (Array.isArray(value)) {
                return value
                    .map(
                        (v) =>
                            `${encodeURIComponent(key)}=${encodeURIComponent(v)}`,
                    )
                    .join("&");
            }

            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .filter(Boolean)
        .join("&");

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ["doctor-schedules", queryString],
        queryFn: () => getAllDoctorSchedules(queryString),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <DoctorSchedulesTable initialQueryString={queryString} />
        </HydrationBoundary>
    );
};

export default DoctorSchedulesManagementPage;