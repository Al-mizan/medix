"use client";

import DateCell from "@/components/shared/cell/DateCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IReview } from "@/types/review.types";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Star } from "lucide-react";

interface ReviewColumnsOptions {
    onView?: (review: IReview) => void;
}

export const getReviewsColumns = ({
    onView,
}: ReviewColumnsOptions = {}): ColumnDef<IReview>[] => [
    {
        id: "patient",
        accessorKey: "patient.name",
        header: "Patient",
        cell: ({ row }) => {
            const patient = row.original.patient;
            return (
                <UserInfoCell
                    name={patient?.name || "Unknown Patient"}
                    email={patient?.email || "No email"}
                    profilePhoto={patient?.profilePhoto || undefined}
                />
            );
        },
    },
    {
        id: "doctor",
        accessorKey: "doctor.name",
        header: "Doctor",
        cell: ({ row }) => {
            const doctor = row.original.doctor;
            return (
                <UserInfoCell
                    name={
                        doctor?.name
                            ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                            : "Unknown Doctor"
                    }
                    email={doctor?.email || "No email"}
                    profilePhoto={doctor?.profilePhoto || undefined}
                />
            );
        },
    },
    {
        id: "rating",
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => {
            const rating = Number(row.original.rating) || 0;
            return (
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                    star <= Math.round(rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-muted text-muted stroke-muted-foreground/40"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                        {rating.toFixed(1)}
                    </span>
                </div>
            );
        },
    },
    {
        id: "comment",
        accessorKey: "comment",
        header: "Comment",
        cell: ({ row }) => {
            const comment = row.original.comment;
            if (!comment) {
                return (
                    <span className="text-xs text-muted-foreground italic">
                        No comment left
                    </span>
                );
            }
            return (
                <p
                    className="text-xs text-foreground truncate max-w-[280px]"
                    title={comment}
                >
                    {comment}
                </p>
            );
        },
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
            return (
                <DateCell
                    date={row.original.createdAt}
                    formatString="MMM dd, yyyy"
                />
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
            const review = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                            onClick={() => onView?.(review)}
                            className="cursor-pointer"
                        >
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            View Review
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const reviewsColumns: ColumnDef<IReview>[] = getReviewsColumns();
