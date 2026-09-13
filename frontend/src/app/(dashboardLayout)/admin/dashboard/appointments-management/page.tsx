import AppointmentsTable from "@/components/modules/Admin/AppointmentsManagement/AppointmentsTable";
import { getAllAppointments } from "@/services/appointment.services";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AppointmentsManagementPage = async ({ searchParams }: PageProps) => {
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
        queryKey: ["appointments", queryString],
        queryFn: () => getAllAppointments(queryString),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AppointmentsTable initialQueryString={queryString} />
        </HydrationBoundary>
    );
};

export default AppointmentsManagementPage;