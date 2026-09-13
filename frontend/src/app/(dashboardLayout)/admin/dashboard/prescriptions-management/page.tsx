import PrescriptionsTable from "@/components/modules/Admin/PrescriptionsManagement/PrescriptionsTable";
import { getAllPrescriptions } from "@/services/prescription.services";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PrescriptionsManagementPage = async ({ searchParams }: PageProps) => {
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
        queryKey: ["prescriptions", queryString],
        queryFn: () => getAllPrescriptions(queryString),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PrescriptionsTable initialQueryString={queryString} />
        </HydrationBoundary>
    );
};

export default PrescriptionsManagementPage;