import TableSkeleton from "@/components/shared/table/TableSkeleton";

export default function ReviewsManagementLoading() {
    return (
        <TableSkeleton
            columnCount={5}
            hasAvatarColumn={true}
            rowCount={6}
        />
    );
}
