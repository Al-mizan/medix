import TableSkeleton from "@/components/shared/table/TableSkeleton";

export default function AdminsManagementLoading() {
    return (
        <TableSkeleton
            columnCount={5}
            hasAvatarColumn={true}
            rowCount={6}
        />
    );
}
