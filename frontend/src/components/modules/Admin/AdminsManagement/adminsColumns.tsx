import DateCell from "@/components/shared/cell/DateCell";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserStatus } from "@/types/doctor.types";
import { IAdmin } from "@/types/admin.types";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Shield, ShieldCheck } from "lucide-react";

interface AdminColumnsOptions {
    currentUserId?: string;
    currentUserRole?: string;
    onStatusChange?: (admin: IAdmin, nextStatus: UserStatus) => void;
    onRoleChange?: (admin: IAdmin, nextRole: "ADMIN" | "SUPER_ADMIN") => void;
}

export const getAdminColumns = ({
    currentUserId,
    currentUserRole,
    onStatusChange,
    onRoleChange,
}: AdminColumnsOptions = {}): ColumnDef<IAdmin>[] => [
    {
        id: "name",
        accessorKey: "name",
        header: "Administrator",
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
        header: "Contact",
        cell: ({ row }) => (
            <span className="text-sm text-foreground">
                {row.original.contactNumber || "N/A"}
            </span>
        ),
    },
    {
        id: "role",
        accessorKey: "user.role",
        header: "Role",
        cell: ({ row }) => {
            const admin = row.original;
            const role = admin.user?.role;
            const isSuperAdmin = role === "SUPER_ADMIN";
            const canChangeRole =
                currentUserRole === "SUPER_ADMIN" &&
                admin.userId !== currentUserId &&
                Boolean(onRoleChange);

            if (canChangeRole) {
                const targetNextRole = isSuperAdmin ? "ADMIN" : "SUPER_ADMIN";
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center gap-1.5 focus:outline-none cursor-pointer">
                            <Badge
                                variant={isSuperAdmin ? "default" : "secondary"}
                                className="font-medium text-xs gap-1 py-0.5 px-2"
                            >
                                {isSuperAdmin ? (
                                    <ShieldCheck className="h-3 w-3" />
                                ) : (
                                    <Shield className="h-3 w-3" />
                                )}
                                <span>{isSuperAdmin ? "Super Admin" : "Admin"}</span>
                                <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() =>
                                    onRoleChange?.(admin, targetNextRole)
                                }
                            >
                                Switch to {isSuperAdmin ? "Admin" : "Super Admin"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }

            return (
                <Badge
                    variant={isSuperAdmin ? "default" : "secondary"}
                    className="font-medium text-xs gap-1 py-0.5 px-2"
                >
                    {isSuperAdmin ? (
                        <ShieldCheck className="h-3 w-3" />
                    ) : (
                        <Shield className="h-3 w-3" />
                    )}
                    <span>{isSuperAdmin ? "Super Admin" : "Admin"}</span>
                </Badge>
            );
        },
    },
    {
        id: "status",
        accessorKey: "user.status",
        header: "Status",
        cell: ({ row }) => {
            const admin = row.original;
            const status = admin.user?.status;
            const isSelf = admin.userId === currentUserId;
            const isTargetSuperAdmin = admin.user?.role === "SUPER_ADMIN";
            const isCurrentSuperAdmin = currentUserRole === "SUPER_ADMIN";

            // Permission check matching backend:
            // Self status cannot be changed
            // Admin cannot change super admin or another admin
            const canChangeStatus =
                !isSelf &&
                (isCurrentSuperAdmin ||
                    (currentUserRole === "ADMIN" && !isTargetSuperAdmin && admin.user?.role !== "ADMIN")) &&
                Boolean(onStatusChange);

            if (canChangeStatus) {
                const nextStatus =
                    status === UserStatus.ACTIVE
                        ? UserStatus.BLOCKED
                        : UserStatus.ACTIVE;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
                            <div className="flex items-center gap-1">
                                <StatusBadgeCell status={status} />
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() => onStatusChange?.(admin, nextStatus)}
                            >
                                Set to {nextStatus === UserStatus.ACTIVE ? "Active" : "Blocked"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }

            return <StatusBadgeCell status={status} />;
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
