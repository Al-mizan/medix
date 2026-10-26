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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
                <Button className="gap-2 w-full sm:w-auto shrink-0">
                    <Plus className="h-4 w-4" />
                    <span>Add Specialty</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0 flex flex-col">
                <DialogHeader className="border-b px-6 py-4 shrink-0">
                    <DialogTitle className="text-lg font-semibold tracking-tight">Add New Specialty</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Create a clinical medical specialty with title, description, and an icon badge.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="create-specialty-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <ScrollArea className="max-h-[calc(90vh-8rem)] overflow-y-auto px-6 py-4">
                        <div className="space-y-4">
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
                                            placeholder="Brief description of the clinical specialty..."
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            rows={3}
                                            className="resize-none text-sm"
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <p className="text-xs text-destructive">
                                                {String(field.state.meta.errors[0])}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </form.Field>

                            <div className="space-y-2">
                                <Label>Specialty Icon</Label>
                                {previewUrl ? (
                                    <div className="relative flex items-center gap-3 p-3 bg-muted/30 border border-border/80 rounded-lg">
                                        <div className="h-14 w-14 rounded-md border border-border/70 bg-background flex items-center justify-center p-1.5 shadow-2xs shrink-0">
                                            <Image
                                                src={previewUrl}
                                                alt="Specialty icon preview"
                                                width={48}
                                                height={48}
                                                className="h-10 w-10 object-contain"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {selectedFile?.name || "Icon selected"}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ""}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2.5"
                                            onClick={handleRemoveFile}
                                        >
                                            <X className="h-3.5 w-3.5 mr-1" />
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-border/80 rounded-lg p-5 text-center hover:bg-muted/15 transition-colors cursor-pointer relative">
                                        <Upload className="mx-auto h-7 w-7 text-muted-foreground/60 mb-2" />
                                        <Label
                                            htmlFor="specialty-icon-upload"
                                            className="cursor-pointer text-xs font-semibold text-primary hover:underline block"
                                        >
                                            Choose an icon file
                                        </Label>
                                        <Input
                                            id="specialty-icon-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            PNG, SVG, or JPG (max 2MB)
                                        </p>
                                    </div>
                                )}
                                {fileError && (
                                    <p className="text-xs text-destructive font-medium">{fileError}</p>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="border-t bg-muted/20 px-6 py-3.5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 shrink-0">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isPending} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                        </DialogClose>
                        <AppSubmitButton form="create-specialty-form" isPending={isPending} className="w-full sm:w-auto">
                            Create Specialty
                        </AppSubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateSpecialtyModal;
