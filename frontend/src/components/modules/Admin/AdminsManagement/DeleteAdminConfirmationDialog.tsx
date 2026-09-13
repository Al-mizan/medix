"use client";

import { deleteAdminAction } from "@/app/(dashboardLayout)/admin/dashboard/admins-management/_action";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type IAdmin } from "@/types/admin.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteAdminConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admin: IAdmin | null;
    currentUserId?: string;
    currentUserRole?: string;
}

const DeleteAdminConfirmationDialog = ({
    open,
    onOpenChange,
    admin,
    currentUserId,
    currentUserRole,
}: DeleteAdminConfirmationDialogProps) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: deleteAdminAction,
    });

    const isSelf = admin?.userId === currentUserId;
    const isSuperAdminTarget = admin?.user?.role === "SUPER_ADMIN";
    const isAdminCaller = currentUserRole === "ADMIN";
    const isHierarchyBlocked = isAdminCaller && isSuperAdminTarget;
    const isDeleteForbidden = isSelf || isHierarchyBlocked;

    const handleConfirmDelete = async () => {
        if (!admin) {
            toast.error("Administrator not found");
            return;
        }

        if (isDeleteForbidden) {
            toast.error("You do not have permission to delete this account");
            return;
        }

        const result = await mutateAsync(admin.id);

        if (!result.success) {
            toast.error(result.message || "Failed to delete administrator");
            return;
        }

        toast.success(result.message || "Administrator deleted successfully");
        onOpenChange(false);

        void queryClient.invalidateQueries({ queryKey: ["admins"] });
        void queryClient.refetchQueries({
            queryKey: ["admins"],
            type: "active",
        });
        router.refresh();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Administrator</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            {admin?.name ?? "this administrator"}
                        </span>
                        ? This action will mark the administrator and linked user account
                        as deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {isSelf && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-xs text-destructive">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>You cannot delete your own administrator account.</span>
                    </div>
                )}

                {isHierarchyBlocked && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 rounded-md flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>Admins cannot delete Super Admin accounts.</span>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={(event) => {
                            event.preventDefault();
                            void handleConfirmDelete();
                        }}
                        disabled={isPending || isDeleteForbidden}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteAdminConfirmationDialog;
