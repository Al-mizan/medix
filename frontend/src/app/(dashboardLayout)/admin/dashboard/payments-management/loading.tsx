import TableSkeleton from "@/components/shared/table/TableSkeleton";

export default function PaymentsManagementLoading() {
    return (
        <TableSkeleton
            columnCount={6}
            hasAvatarColumn={false}
            rowCount={6}
        />
    );
}
