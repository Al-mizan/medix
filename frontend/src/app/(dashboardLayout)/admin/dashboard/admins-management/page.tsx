import AdminsTable from "@/components/modules/Admin/AdminsManagement/AdminsTable";
import { getAllAdmins } from "@/services/admin.services";
import { getUserInfo } from "@/services/auth.services";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

const AdminsManagementPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const queryParamsObjects = await searchParams;
    const userInfo = await getUserInfo();

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
        queryKey: ["admins", queryString],
        queryFn: () => getAllAdmins(queryString),
        staleTime: 1000 * 60 * 5,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminsTable
                initialQueryString={queryString}
                currentUserId={userInfo?.id}
                currentUserRole={userInfo?.role}
            />
        </HydrationBoundary>
    );
};

export default AdminsManagementPage;