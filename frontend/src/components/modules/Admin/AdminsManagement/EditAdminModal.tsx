"use client";

import { updateAdminAction } from "@/app/(dashboardLayout)/admin/dashboard/admins-management/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { type IAdmin } from "@/types/admin.types";
import {
    updateAdminFormZodSchema,
    type IUpdateAdminFormValues,
} from "@/zod/admin.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface EditAdminModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admin: IAdmin | null;
    currentUserRole?: string;
}

const EditAdminModal = ({
    open,
    onOpenChange,
    admin,
    currentUserRole,
}: EditAdminModalProps) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: IUpdateAdminFormValues;
        }) =>
            updateAdminAction(id, {
                admin: {
                    name: payload.name,
                    contactNumber: payload.contactNumber || undefined,
                },
            }),
    });

    const isForbidden =
        currentUserRole === "ADMIN" && admin?.user?.role === "SUPER_ADMIN";

    const form = useForm({
        defaultValues: {
            name: admin?.name || "",
            contactNumber: admin?.contactNumber || "",
        },
        onSubmit: async ({ value }) => {
            if (!admin) return;

            const result = await mutateAsync({
                id: admin.id,
                payload: value,
            });

            if (!result.success) {
                toast.error(result.message || "Failed to update administrator");
                return;
            }

            toast.success("Administrator updated successfully");
            await queryClient.invalidateQueries({ queryKey: ["admins"] });
            onOpenChange(false);
        },
    });

    useEffect(() => {
        if (admin) {
            form.reset({
                name: admin.name || "",
                contactNumber: admin.contactNumber || "",
            });
        }
    }, [admin, form]);

    if (!admin) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Administrator</DialogTitle>
                    <DialogDescription>
                        Update details for {admin.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage
                            src={admin.profilePhoto || undefined}
                            alt={admin.name}
                        />
                        <AvatarFallback>
                            {admin.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                            {admin.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {admin.email}
                        </span>
                        <div className="pt-1">
                            <Badge
                                variant={
                                    admin.user?.role === "SUPER_ADMIN"
                                        ? "default"
                                        : "secondary"
                                }
                                className="text-xs gap-1"
                            >
                                {admin.user?.role === "SUPER_ADMIN" ? (
                                    <ShieldCheck className="h-3 w-3" />
                                ) : (
                                    <Shield className="h-3 w-3" />
                                )}
                                <span>
                                    {admin.user?.role === "SUPER_ADMIN"
                                        ? "Super Admin"
                                        : "Admin"}
                                </span>
                            </Badge>
                        </div>
                    </div>
                </div>

                {isForbidden ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 rounded-md flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>Admins cannot edit Super Admin profiles.</span>
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                        className="space-y-4 pt-2"
                    >
                        <form.Field
                            name="name"
                            validators={{
                                onChange: ({ value }) => {
                                    const parsed =
                                        updateAdminFormZodSchema.shape.name.safeParse(
                                            value
                                        );
                                    return parsed.success
                                        ? undefined
                                        : parsed.error.issues[0]?.message;
                                },
                            }}
                        >
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Full Name"
                                    placeholder="e.g. Eleanor Vance"
                                />
                            )}
                        </form.Field>

                        <form.Field
                            name="contactNumber"
                            validators={{
                                onChange: ({ value }) => {
                                    const parsed =
                                        updateAdminFormZodSchema.shape.contactNumber.safeParse(
                                            value
                                        );
                                    return parsed.success
                                        ? undefined
                                        : parsed.error.issues[0]?.message;
                                },
                            }}
                        >
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Contact Number"
                                    placeholder="e.g. 01712345678"
                                />
                            )}
                        </form.Field>

                        <div className="flex justify-end gap-2 pt-4">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <AppSubmitButton
                                isPending={isPending}
                                label="Save Changes"
                            />
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditAdminModal;
