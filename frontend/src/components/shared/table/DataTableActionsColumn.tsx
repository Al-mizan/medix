"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export interface DataTableActions<TData> {
    onView?: (data: TData) => void;
    onEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
}

export function createActionsColumn<TData>(
    actions: DataTableActions<TData>,
): ColumnDef<TData> {
    return {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
            const rowData = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                        >
                            <span className="sr-only">Open Menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        {actions.onView && (
                            <DropdownMenuItem
                                onClick={() => actions.onView?.(rowData)}
                            >
                                View
                            </DropdownMenuItem>
                        )}

                        {actions.onEdit && (
                            <DropdownMenuItem
                                onClick={() => actions.onEdit?.(rowData)}
                            >
                                Edit
                            </DropdownMenuItem>
                        )}

                        {actions.onDelete && (
                            <DropdownMenuItem
                                onClick={() => actions.onDelete?.(rowData)}
                            >
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    };
}
