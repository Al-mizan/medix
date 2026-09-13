import DateCell from "@/components/shared/cell/DateCell";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { IPatient } from "@/types/patient.types";
import { ColumnDef } from "@tanstack/react-table";

export const patientColumns: ColumnDef<IPatient>[] = [
    {
        id: "name",
        accessorKey: "name",
        header: "Patient",
        cell: ({ row }) => (
            <UserInfoCell
                name={row.original.name}
                email={row.original.email}
                profilePhoto={row.original.profilePhoto || undefined}
            />
        ),
    },
    {
        id: "contactNumber",
        accessorKey: "contactNumber",
        header: "Contact Number",
        cell: ({ row }) => (
            <span className="text-sm text-foreground">
                {row.original.contactNumber || "N/A"}
            </span>
        ),
    },
    {
        id: "address",
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                {row.original.address || "N/A"}
            </span>
        ),
    },
    {
        id: "status",
        accessorKey: "user.status",
        header: "Status",
        cell: ({ row }) => {
            return <StatusBadgeCell status={row.original.user.status} />;
        },
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Joined On",
        cell: ({ row }) => {
            return (
                <DateCell
                    date={row.original.createdAt}
                    formatString="MMM dd, yyyy"
                />
            );
        },
    },
];
