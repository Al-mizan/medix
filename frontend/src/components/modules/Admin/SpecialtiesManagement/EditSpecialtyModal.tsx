"use client";

import { updateSpecialtyAction } from "@/app/(dashboardLayout)/admin/dashboard/specialties-management/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ISpecialty } from "@/types/specialty.types";
import {
    updateSpecialtyFormZodSchema,
    type IUpdateSpecialtyFormValues,
} from "@/zod/specialty.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface EditSpecialtyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    specialty: ISpecialty | null;
}

const EditSpecialtyModal = ({
    open,
    onOpenChange,
    specialty,
}: EditSpecialtyModalProps) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: IUpdateSpecialtyFormValues;
        }) => updateSpecialtyAction(id, payload),
    });

    const form = useForm({
        defaultValues: {
            title: specialty?.title || "",
            description: specialty?.description || "",
        },
        onSubmit: async ({ value }) => {
            if (!specialty) return;

            const result = await mutateAsync({
                id: specialty.id,
                payload: {
                    title: value.title,
                    description: value.description || undefined,
                },
            });

            if (!result.success) {
                toast.error(result.message || "Failed to update specialty");
                return;
            }

            toast.success("Specialty updated successfully");
            await queryClient.invalidateQueries({ queryKey: ["specialties"] });
            onOpenChange(false);
        },
    });

    useEffect(() => {
        if (specialty) {
            form.reset({
                title: specialty.title || "",
                description: specialty.description || "",
            });
        }
    }, [specialty, form]);

    if (!specialty) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Specialty</DialogTitle>
                    <DialogDescription>
                        Update details for {specialty.title}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                    <Avatar className="h-12 w-12 rounded-md border bg-muted/20">
                        <AvatarImage
                            src={specialty.icon || undefined}
                            alt={specialty.title}
                            className="object-contain p-1"
                        />
                        <AvatarFallback className="rounded-md">
                            <Stethoscope className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                            {specialty.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {specialty.doctorSpecialties?.length ?? 0} doctors assigned
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-4 pt-2"
                >
                    <form.Field
                        name="title"
                        validators={{
                            onChange: ({ value }) => {
                                const parsed = updateSpecialtyFormZodSchema.shape.title.safeParse(value);
                                return parsed.success ? undefined : parsed.error.issues[0]?.message;
                            },
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Specialty Title"
                                placeholder="e.g. Cardiology"
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="description"
                        validators={{
                            onChange: ({ value }) => {
                                const parsed = updateSpecialtyFormZodSchema.shape.description.safeParse(value);
                                return parsed.success ? undefined : parsed.error.issues[0]?.message;
                            },
                        }}
                    >
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-description">Description (Optional)</Label>
                                <Textarea
                                    id="edit-description"
                                    placeholder="Brief description of the medical specialty..."
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    rows={3}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-sm text-destructive">
                                        {String(field.state.meta.errors[0])}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <AppSubmitButton isPending={isPending}>
                            Save Changes
                        </AppSubmitButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditSpecialtyModal;
