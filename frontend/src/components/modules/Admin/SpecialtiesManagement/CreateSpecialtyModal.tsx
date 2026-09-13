"use client";

import { createSpecialtyAction } from "@/app/(dashboardLayout)/admin/dashboard/specialties-management/_action";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    createSpecialtyFormZodSchema,
    type ICreateSpecialtyFormValues,
} from "@/zod/specialty.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

const defaultValues: ICreateSpecialtyFormValues = {
    title: "",
    description: "",
};

const CreateSpecialtyModal = () => {
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: createSpecialtyAction,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFileError("Please upload an image file");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setFileError("Icon file size must be less than 2MB");
            return;
        }

        setFileError(null);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleClose = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            handleRemoveFile();
            setFileError(null);
        }
    };

    const form = useForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            if (!selectedFile) {
                setFileError("Specialty icon is required");
                return;
            }

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append(
                "data",
                JSON.stringify({
                    title: value.title,
                    description: value.description || undefined,
                })
            );

            const result = await mutateAsync(formData);

            if (!result.success) {
                toast.error(result.message || "Failed to create specialty");
                return;
            }

            toast.success("Specialty created successfully");
            await queryClient.invalidateQueries({ queryKey: ["specialties"] });
            handleClose(false);
            form.reset();
        },
    });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Specialty</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Specialty</DialogTitle>
                    <DialogDescription>
                        Create a medical specialty with title, description, and icon.
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
                        name="title"
                        validators={{
                            onChange: ({ value }) => {
                                const parsed = createSpecialtyFormZodSchema.shape.title.safeParse(value);
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
                                const parsed = createSpecialtyFormZodSchema.shape.description.safeParse(value);
                                return parsed.success ? undefined : parsed.error.issues[0]?.message;
                            },
                        }}
                    >
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
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

                    <div className="space-y-1.5">
                        <Label>Specialty Icon</Label>
                        {previewUrl ? (
                            <div className="relative inline-block border rounded-md p-2 bg-muted/20">
                                <Image
                                    src={previewUrl}
                                    alt="Icon Preview"
                                    width={64}
                                    height={64}
                                    className="h-16 w-16 object-contain"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                                    onClick={handleRemoveFile}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border border-dashed rounded-md p-4 text-center hover:bg-muted/10 transition-colors">
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                                <Label
                                    htmlFor="specialty-icon-upload"
                                    className="cursor-pointer text-sm font-medium text-primary hover:underline"
                                >
                                    Upload an icon
                                </Label>
                                <Input
                                    id="specialty-icon-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    PNG, SVG, or JPG (max 2MB)
                                </p>
                            </div>
                        )}
                        {fileError && (
                            <p className="text-sm text-destructive">{fileError}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <AppSubmitButton isPending={isPending}>
                            Create Specialty
                        </AppSubmitButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateSpecialtyModal;
