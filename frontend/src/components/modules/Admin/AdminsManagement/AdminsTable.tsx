"use client";

import DataTable from "@/components/shared/table/DataTable";
import {
    DataTableFilterConfig,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import {
    serverManagedFilter,
    useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { getAllAdmins } from "@/services/admin.services";
import { PaginationMeta } from "@/types/api.types";
import { IAdmin } from "@/types/admin.types";
import { UserStatus } from "@/types/doctor.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
    changeUserRoleAction,
    changeUserStatusAction,
} from "@/app/(dashboardLayout)/admin/dashboard/admins-management/_action";
import { getAdminColumns } from "./adminsColumns";
import CreateAdminModal from "./CreateAdminModal";
import DeleteAdminConfirmationDialog from "./DeleteAdminConfirmationDialog";
import EditAdminModal from "./EditAdminModal";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const ROLE_FILTER_KEY = "user.role";
const STATUS_FILTER_KEY = "user.status";

const ADMIN_FILTER_DEFINITIONS = [
    serverManagedFilter.single(ROLE_FILTER_KEY),
    serverManagedFilter.single(STATUS_FILTER_KEY),
];

interface AdminsTableProps {
    initialQueryString: string;
    currentUserId?: string;
    currentUserRole?: string;
}

const AdminsTable = ({
    initialQueryString,
    currentUserId,
    currentUserRole,
}: AdminsTableProps) => {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const {
        editingItem,
        deletingItem,
        isEditModalOpen,
        isDeleteDialogOpen,
        onEditOpenChange,
        onDeleteOpenChange,
        tableActions,
    } = useRowActionModalState<IAdmin>({
        enableView: false,
        enableEdit: true,
        enableDelete: true,
    });

    const {
        queryStringFromUrl,
        optimisticSortingState,
        optimisticPaginationState,
        isRouteRefreshPending,
        updateParams,
        handleSortingChange,
        handlePaginationChange,
    } = useServerManagedDataTable({
        searchParams,
        defaultPage: DEFAULT_PAGE,
        defaultLimit: DEFAULT_LIMIT,
    });

    const queryString = queryStringFromUrl || initialQueryString;

    const { searchTermFromUrl, handleDebouncedSearchChange } =
        useServerManagedDataTableSearch({
            searchParams,
            updateParams,
        });

    const { filterValues, handleFilterChange, clearAllFilters } =
        useServerManagedDataTableFilters({
            searchParams,
            definitions: ADMIN_FILTER_DEFINITIONS,
            updateParams,
        });

    const {
        data: adminsDataResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["admins", queryString],
        queryFn: () => getAllAdmins(queryString),
    });

    const { mutateAsync: mutateStatus } = useMutation({
        mutationFn: changeUserStatusAction,
    });

    const { mutateAsync: mutateRole } = useMutation({
        mutationFn: changeUserRoleAction,
    });

    const handleStatusChange = useCallback(
        async (admin: IAdmin, nextStatus: UserStatus) => {
            const result = await mutateStatus({
                userId: admin.userId,
                userStatus: nextStatus,
            });

            if (!result.success) {
                toast.error(result.message || "Failed to change user status");
                return;
            }

            toast.success("User status updated successfully");
            await queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
        [mutateStatus, queryClient]
    );

    const handleRoleChange = useCallback(
        async (admin: IAdmin, nextRole: "ADMIN" | "SUPER_ADMIN") => {
            const result = await mutateRole({
                userId: admin.userId,
                role: nextRole,
            });

            if (!result.success) {
                toast.error(result.message || "Failed to change user role");
                return;
            }

            toast.success("User role updated successfully");
            await queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
        [mutateRole, queryClient]
    );

    const admins = adminsDataResponse?.data ?? [];
    const meta: PaginationMeta | undefined = adminsDataResponse?.meta;
    const isSuperAdmin = currentUserRole === "SUPER_ADMIN";

    const columns = useMemo(() => {
        return getAdminColumns({
            currentUserId,
            currentUserRole,
            onStatusChange: handleStatusChange,
            onRoleChange: handleRoleChange,
        });
    }, [currentUserId, currentUserRole, handleStatusChange, handleRoleChange]);

    const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
        return [
            {
                id: ROLE_FILTER_KEY,
                label: "Role",
                type: "single-select",
                options: [
                    { label: "Super Admin", value: "SUPER_ADMIN" },
                    { label: "Admin", value: "ADMIN" },
                ],
            },
            {
                id: STATUS_FILTER_KEY,
                label: "Status",
                type: "single-select",
                options: [
                    { label: "Active", value: "ACTIVE" },
                    { label: "Blocked", value: "BLOCKED" },
                ],
            },
        ];
    }, []);

    const filterValuesForTable = useMemo<DataTableFilterValues>(() => {
        return {
            [ROLE_FILTER_KEY]: filterValues[ROLE_FILTER_KEY],
            [STATUS_FILTER_KEY]: filterValues[STATUS_FILTER_KEY],
        };
    }, [filterValues]);

    return (
        <>
            <DataTable
                data={admins}
                columns={columns}
                isLoading={isLoading || isFetching || isRouteRefreshPending}
                emptyMessage="No administrators found."
                sorting={{
                    state: optimisticSortingState,
                    onSortingChange: handleSortingChange,
                }}
                pagination={{
                    state: optimisticPaginationState,
                    onPaginationChange: handlePaginationChange,
                }}
                search={{
                    initialValue: searchTermFromUrl,
                    placeholder: "Search admin by name, email...",
                    debounceMs: 700,
                    onDebouncedChange: handleDebouncedSearchChange,
                }}
                filters={{
                    configs: filterConfigs,
                    values: filterValuesForTable,
                    onFilterChange: handleFilterChange,
                    onClearAll: clearAllFilters,
                }}
                toolbarAction={<CreateAdminModal isSuperAdmin={isSuperAdmin} />}
                meta={meta}
                actions={tableActions}
            />

            <EditAdminModal
                open={isEditModalOpen}
                onOpenChange={onEditOpenChange}
                admin={editingItem}
                currentUserRole={currentUserRole}
            />

            <DeleteAdminConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={onDeleteOpenChange}
                admin={deletingItem}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
            />
        </>
    );
};

export default AdminsTable;
