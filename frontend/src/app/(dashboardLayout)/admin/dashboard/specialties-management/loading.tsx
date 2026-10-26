import TableSkeleton from "@/components/shared/table/TableSkeleton";

export default function SpecialtiesManagementLoading() {
    return (
        <TableSkeleton
            columnCount={4}
            hasAvatarColumn={true}
            rowCount={6}
        />
    );
}
