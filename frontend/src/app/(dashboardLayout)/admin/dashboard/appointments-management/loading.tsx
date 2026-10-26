import TableSkeleton from "@/components/shared/table/TableSkeleton";

export default function AppointmentsManagementLoading() {
    return (
        <TableSkeleton
            columnCount={6}
            hasAvatarColumn={true}
            rowCount={6}
        />
    );
}
