import DateCell from "@/components/shared/cell/DateCell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ISpecialty } from "@/types/specialty.types";
import { ColumnDef } from "@tanstack/react-table";
import { Stethoscope } from "lucide-react";

export const specialtyColumns: ColumnDef<ISpecialty>[] = [
    {
        id: "icon",
        accessorKey: "icon",
        header: "Icon",
        enableSorting: false,
        cell: ({ row }) => {
            const icon = row.original.icon;
            const title = row.original.title;
            const initials = title ? title.slice(0, 2).toUpperCase() : "SP";

            return (
                <Avatar className="h-10 w-10 rounded-md border bg-muted/30">
                    <AvatarImage
                        src={icon || undefined}
                        alt={title}
                        className="object-contain p-1"
                    />
                    <AvatarFallback className="rounded-md">
                        <Stethoscope className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
            );
        },
    },
    {
        id: "title",
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-sm text-foreground">
                    {row.original.title}
                </span>
            </div>
        ),
    },
    {
        id: "description",
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground line-clamp-2 max-w-[320px]">
                {row.original.description || "—"}
            </span>
        ),
    },
    {
        id: "doctorCount",
        header: "Doctors",
        enableSorting: false,
        cell: ({ row }) => {
            const count = row.original.doctorSpecialties?.length ?? 0;
            return (
                <Badge variant="secondary" className="font-normal text-xs">
                    {count} {count === 1 ? "Doctor" : "Doctors"}
                </Badge>
            );
        },
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created On",
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
