"use client";

import { deletePatientAction } from "@/app/(dashboardLayout)/admin/dashboard/patients-management/_action";
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
import { type IPatient } from "@/types/patient.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeletePatientConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: IPatient | null;
}

const DeletePatientConfirmationDialog = ({
    open,
    onOpenChange,
    patient,
}: DeletePatientConfirmationDialogProps) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: deletePatientAction,
    });

    const handleConfirmDelete = async () => {
        if (!patient) {
            toast.error("Patient not found");
            return;
        }

        const result = await mutateAsync(patient.id);

        if (!result.success) {
            toast.error(result.message || "Failed to delete patient");
            return;
        }

        toast.success(result.message || "Patient deleted successfully");
        onOpenChange(false);

        void queryClient.invalidateQueries({ queryKey: ["patients"] });
        void queryClient.refetchQueries({
            queryKey: ["patients"],
            type: "active",
        });
        router.refresh();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            {patient?.name ?? "this patient"}
                        </span>
                        ? This action will mark the patient profile and linked user
                        account as deleted.
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

export default DeletePatientConfirmationDialog;
