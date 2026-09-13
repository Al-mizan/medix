"use client";

import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ISpecialty } from "@/types/specialty.types";
import { createDoctorFormZodSchema } from "@/zod/doctor.validation";
import { Plus } from "lucide-react";
import SpecialtiesMultiSelect from "./SpecialtiesMultiSelect";
import DoctorIdentityFields from "./DoctorIdentityFields";
import DoctorProfessionalFields from "./DoctorProfessionalFields";
import DoctorAddressField from "./DoctorAddressField";
import { useCreateDoctorForm, getErrorMessage } from "./useCreateDoctorForm";

interface CreateDoctorFormModalProps {
    specialties: ISpecialty[];
    isLoadingSpecialties?: boolean;
}

const CreateDoctorFormModal = ({
    specialties,
    isLoadingSpecialties = false,
}: CreateDoctorFormModalProps) => {
    const [open, setOpen] = useState(false);
    const { form, isPending, handleOpenChange } = useCreateDoctorForm({
        onSuccess: () => setOpen(false),
    });

    return (
        <Dialog open={open} onOpenChange={(next) => handleOpenChange(next, setOpen)}>
            <DialogTrigger asChild>
                <Button type="button" className="ml-auto shrink-0">
                    <Plus className="size-4" />
                    Create Doctor
                </Button>
            </DialogTrigger>

            <DialogContent
                className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] md:w-[calc(100vw-4rem)] md:max-w-[calc(100vw-4rem)] lg:w-[min(92vw,78rem)] lg:max-w-[min(92vw,78rem)] xl:w-[min(88vw,88rem)] xl:max-w-[min(88vw,88rem)] 2xl:w-[min(84vw,96rem)] 2xl:max-w-[min(84vw,96rem)]"
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
            >
                <DialogHeader className="border-b px-6 py-5 pr-14">
                    <DialogTitle>Create Doctor</DialogTitle>
                    <DialogDescription>
                        Add a new doctor profile with account credentials and specialties.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
                    <div className="px-6 py-5">
                        <form
                            method="POST"
                            action="#"
                            noValidate
                            onSubmit={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                form.handleSubmit();
                            }}
                            className="space-y-5"
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <DoctorIdentityFields
                                    form={form}
                                    schema={createDoctorFormZodSchema}
                                    includeAuthFields
                                />
                                <DoctorProfessionalFields
                                    form={form}
                                    schema={createDoctorFormZodSchema}
                                />
                                <DoctorAddressField
                                    form={form}
                                    schema={createDoctorFormZodSchema}
                                />
                            </div>

                            <form.Field
                                name="specialties"
                                validators={{
                                    onChange: createDoctorFormZodSchema.shape.specialties,
                                }}
                            >
                                {(field) => {
                                    const firstError =
                                        field.state.meta.isTouched &&
                                        field.state.meta.errors.length > 0
                                            ? field.state.meta.errors[0]
                                            : null;

                                    return (
                                        <SpecialtiesMultiSelect
                                            specialties={specialties}
                                            selectedSpecialtyIds={field.state.value}
                                            onChange={field.handleChange}
                                            onBlur={field.handleBlur}
                                            isLoadingSpecialties={isLoadingSpecialties}
                                            error={firstError}
                                            getErrorMessage={getErrorMessage}
                                        />
                                    );
                                }}
                            </form.Field>

                            <div className="flex items-center justify-end gap-3 border-t pt-4">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isPending}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <form.Subscribe
                                    selector={(state) =>
                                        [state.canSubmit, state.isSubmitting] as const
                                    }
                                >
                                    {([canSubmit, isSubmitting]) => (
                                        <AppSubmitButton
                                            isPending={isSubmitting || isPending}
                                            pendingLabel="Creating doctor..."
                                            disabled={!canSubmit || isLoadingSpecialties}
                                            className="w-auto min-w-36"
                                        >
                                            Create Doctor
                                        </AppSubmitButton>
                                    )}
                                </form.Subscribe>
                            </div>
                        </form>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default CreateDoctorFormModal;
