import TableSkeleton from "@/components/shared/table/TableSkeleton";

export default function SchedulesManagementLoading() {
    return (
        <TableSkeleton
            columnCount={5}
            hasAvatarColumn={false}
            rowCount={6}
        />
    );
}
