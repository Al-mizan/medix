"use client";

import { createAdminAction } from "@/app/(dashboardLayout)/admin/dashboard/admins-management/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createAdminFormZodSchema,
    type ICreateAdminFormValues,
} from "@/zod/admin.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateAdminModalProps {
    isSuperAdmin?: boolean;
}

const defaultValues: ICreateAdminFormValues = {
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    role: "ADMIN",
};

const CreateAdminModal = ({ isSuperAdmin = false }: CreateAdminModalProps) => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: createAdminAction,
    });

    const form = useForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            const payload = {
                password: value.password,
                admin: {
                    name: value.name,
                    email: value.email,
                    contactNumber: value.contactNumber || undefined,
                },
                role: value.role,
            };

            const result = await mutateAsync(payload);

            if (!result.success) {
                toast.error(result.message || "Failed to create admin");
                return;
            }

            toast.success("Administrator created successfully");
            await queryClient.invalidateQueries({ queryKey: ["admins"] });
            setOpen(false);
            form.reset();
        },
    });

    if (!isSuperAdmin) {
        return (
            <Button
                variant="outline"
                className="gap-2 opacity-60 cursor-not-allowed"
                disabled
                title="Only Super Admins can create new administrators"
            >
                <ShieldAlert className="h-4 w-4" />
                <span>Add Administrator</span>
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Administrator</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Administrator</DialogTitle>
                    <DialogDescription>
                        Create a new Admin or Super Admin user account.
                    </DialogDescription>
                </DialogHeader>

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
                                const parsed = createAdminFormZodSchema.shape.name.safeParse(value);
                                return parsed.success ? undefined : parsed.error.issues[0]?.message;
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
                        name="email"
                        validators={{
                            onChange: ({ value }) => {
                                const parsed = createAdminFormZodSchema.shape.email.safeParse(value);
                                return parsed.success ? undefined : parsed.error.issues[0]?.message;
                            },
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Email Address"
                                type="email"
                                placeholder="admin@example.com"
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="password"
                        validators={{
                            onChange: ({ value }) => {
                                const parsed = createAdminFormZodSchema.shape.password.safeParse(value);
                                return parsed.success ? undefined : parsed.error.issues[0]?.message;
                            },
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Password"
                                type="password"
                                placeholder="Min 6 characters"
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="contactNumber"
                        validators={{
                            onChange: ({ value }) => {
                                const parsed = createAdminFormZodSchema.shape.contactNumber.safeParse(value);
                                return parsed.success ? undefined : parsed.error.issues[0]?.message;
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

                    <form.Field name="role">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="admin-role">System Role</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(val: "ADMIN" | "SUPER_ADMIN") =>
                                        field.handleChange(val)
                                    }
                                >
                                    <SelectTrigger id="admin-role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="SUPER_ADMIN">
                                            Super Admin
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <AppSubmitButton
                            isPending={isPending}
                            label="Create Account"
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateAdminModal;
