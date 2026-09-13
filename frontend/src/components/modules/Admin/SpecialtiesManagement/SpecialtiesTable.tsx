"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { getSpecialties } from "@/services/specialty.services";
import { PaginationMeta } from "@/types/api.types";
import { ISpecialty } from "@/types/specialty.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import CreateSpecialtyModal from "./CreateSpecialtyModal";
import DeleteSpecialtyConfirmationDialog from "./DeleteSpecialtyConfirmationDialog";
import EditSpecialtyModal from "./EditSpecialtyModal";
import { specialtyColumns } from "./specialtiesColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const SpecialtiesTable = ({
    initialQueryString,
}: {
    initialQueryString: string;
}) => {
    const searchParams = useSearchParams();
    const {
        editingItem,
        deletingItem,
        isEditModalOpen,
        isDeleteDialogOpen,
        onEditOpenChange,
        onDeleteOpenChange,
        tableActions,
    } = useRowActionModalState<ISpecialty>({
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

    const {
        data: specialtiesDataResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["specialties", queryString],
        queryFn: () => getSpecialties(queryString),
    });

    const specialties = specialtiesDataResponse?.data ?? [];
    const meta: PaginationMeta | undefined = specialtiesDataResponse?.meta;

    return (
        <>
            <DataTable
                data={specialties}
                columns={specialtyColumns}
                isLoading={isLoading || isFetching || isRouteRefreshPending}
                emptyMessage="No specialties found."
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
                    placeholder: "Search specialty by title...",
                    debounceMs: 700,
                    onDebouncedChange: handleDebouncedSearchChange,
                }}
                toolbarAction={<CreateSpecialtyModal />}
                meta={meta}
                actions={tableActions}
            />

            <EditSpecialtyModal
                open={isEditModalOpen}
                onOpenChange={onEditOpenChange}
                specialty={editingItem}
            />

            <DeleteSpecialtyConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={onDeleteOpenChange}
                specialty={deletingItem}
            />
        </>
    );
};

export default SpecialtiesTable;
