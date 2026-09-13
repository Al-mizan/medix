import PaymentsTable from "@/components/modules/Admin/PaymentsManagement/PaymentsTable";
import { getAllPayments } from "@/services/payment.services";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PaymentsManagementPage = async ({ searchParams }: PageProps) => {
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
        queryKey: ["payments", queryString],
        queryFn: () => getAllPayments(queryString),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PaymentsTable initialQueryString={queryString} />
        </HydrationBoundary>
    );
};

export default PaymentsManagementPage;