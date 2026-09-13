"use client";

import { deleteSpecialtyAction } from "@/app/(dashboardLayout)/admin/dashboard/specialties-management/_action";
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
import { type ISpecialty } from "@/types/specialty.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteSpecialtyConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    specialty: ISpecialty | null;
}

const DeleteSpecialtyConfirmationDialog = ({
    open,
    onOpenChange,
    specialty,
}: DeleteSpecialtyConfirmationDialogProps) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: deleteSpecialtyAction,
    });

    const handleConfirmDelete = async () => {
        if (!specialty) {
            toast.error("Specialty not found");
            return;
        }

        const result = await mutateAsync(specialty.id);

        if (!result.success) {
            toast.error(result.message || "Failed to delete specialty");
            return;
        }

        toast.success(result.message || "Specialty deleted successfully");
        onOpenChange(false);

        void queryClient.invalidateQueries({ queryKey: ["specialties"] });
        void queryClient.refetchQueries({
            queryKey: ["specialties"],
            type: "active",
        });
        router.refresh();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Specialty</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            {specialty?.title ?? "this specialty"}
                        </span>
                        ? This action will mark the specialty as deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>

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
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteSpecialtyConfirmationDialog;
