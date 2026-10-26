import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TableSkeletonProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
    showToolbar?: boolean;
    columnCount?: number;
    rowCount?: number;
    hasAvatarColumn?: boolean;
    className?: string;
}

export default function TableSkeleton({
    showHeader = true,
    showToolbar = true,
    columnCount = 5,
    rowCount = 5,
    hasAvatarColumn = true,
    className = "",
}: TableSkeletonProps) {
    return (
        <div className={`space-y-5 animate-in fade-in duration-200 ${className}`}>
            {/* Page Header Skeleton */}
            {showHeader && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
                    <div className="space-y-1.5">
                        <Skeleton className="h-7 w-48 rounded-lg" />
                        <Skeleton className="h-4 w-72 rounded-md" />
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <Skeleton className="h-9 w-32 rounded-lg" />
                    </div>
                </div>
            )}

            {/* Main Table Shell Card */}
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                {/* Search & Filter Toolbar Skeleton */}
                {showToolbar && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-border/70 bg-muted/15">
                        <div className="flex flex-1 items-center gap-2.5">
                            <Skeleton className="h-9 w-full sm:w-64 rounded-lg" />
                            <Skeleton className="h-9 w-24 rounded-lg hidden sm:block" />
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <Skeleton className="h-9 w-28 rounded-lg" />
                        </div>
                    </div>
                )}

                {/* Table Content Skeleton */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/70 bg-muted/40">
                                {Array.from({ length: columnCount }).map((_, i) => (
                                    <th key={i} className="h-10 px-4 text-left align-middle">
                                        <Skeleton
                                            className={`h-3.5 rounded-md ${
                                                i === 0
                                                    ? "w-28"
                                                    : i === columnCount - 1
                                                      ? "w-12 ml-auto"
                                                      : "w-20"
                                            }`}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {Array.from({ length: rowCount }).map((_, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    {Array.from({ length: columnCount }).map((_, colIndex) => {
                                        // First Column with Avatar + multi-line info
                                        if (colIndex === 0 && hasAvatarColumn) {
                                            return (
                                                <td key={colIndex} className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="size-9 rounded-full shrink-0" />
                                                        <div className="space-y-1.5 min-w-0">
                                                            <Skeleton className="h-3.5 w-32 rounded-md" />
                                                            <Skeleton className="h-3 w-44 rounded-md" />
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        // Last Column with Action Buttons
                                        if (colIndex === columnCount - 1) {
                                            return (
                                                <td key={colIndex} className="p-4 align-middle text-right">
                                                    <Skeleton className="size-8 rounded-lg ml-auto" />
                                                </td>
                                            );
                                        }

                                        // Second-to-last Column as Status Badge
                                        if (colIndex === columnCount - 2) {
                                            return (
                                                <td key={colIndex} className="p-4 align-middle">
                                                    <Skeleton className="h-5 w-16 rounded-full" />
                                                </td>
                                            );
                                        }

                                        // Normal Text Columns
                                        const widths = ["w-24", "w-36", "w-28", "w-32", "w-20"];
                                        const widthClass = widths[(colIndex + rowIndex) % widths.length];

                                        return (
                                            <td key={colIndex} className="p-4 align-middle">
                                                <Skeleton className={`h-3.5 ${widthClass} rounded-md`} />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer Skeleton */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/70 bg-muted/10">
                    <Skeleton className="h-3.5 w-36 rounded-md" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-20 rounded-lg" />
                        <div className="flex items-center gap-1">
                            <Skeleton className="size-8 rounded-lg" />
                            <Skeleton className="size-8 rounded-lg" />
                            <Skeleton className="size-8 rounded-lg" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
