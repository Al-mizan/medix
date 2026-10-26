"use client";

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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type IDoctor } from "@/types/doctor.types";
import { type ISpecialty } from "@/types/specialty.types";
import { editDoctorFormZodSchema } from "@/zod/doctor.validation";
import SpecialtiesMultiSelect from "./SpecialtiesMultiSelect";
import DoctorIdentityFields from "./DoctorIdentityFields";
import DoctorProfessionalFields from "./DoctorProfessionalFields";
import DoctorAddressField from "./DoctorAddressField";
import { useEditDoctorForm } from "./useEditDoctorForm";
import { getErrorMessage } from "./useCreateDoctorForm";

interface EditDoctorFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctor: IDoctor | null;
    specialties: ISpecialty[];
    isLoadingSpecialties?: boolean;
}

const EditDoctorFormModal = ({
    open,
    onOpenChange,
    doctor,
    specialties,
    isLoadingSpecialties = false,
}: EditDoctorFormModalProps) => {
    const { form, isPending } = useEditDoctorForm({
        doctor,
        open,
        onSuccess: () => onOpenChange(false),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] md:w-[calc(100vw-4rem)] md:max-w-[calc(100vw-4rem)] lg:w-[min(92vw,78rem)] lg:max-w-[min(92vw,78rem)] xl:w-[min(88vw,88rem)] xl:max-w-[min(88vw,88rem)] 2xl:w-[min(84vw,96rem)] 2xl:max-w-[min(84vw,96rem)] flex flex-col"
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
            >
                <DialogHeader className="border-b px-6 py-4 pr-14 shrink-0">
                    <DialogTitle className="text-lg font-semibold tracking-tight">Edit Doctor Profile</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Update details, professional qualifications, and specialties.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="edit-doctor-form"
                    method="POST"
                    action="#"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <ScrollArea className="max-h-[calc(90vh-8.5rem)] overflow-y-auto px-6 py-5">
                        <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <DoctorIdentityFields
                                    form={form}
                                    schema={editDoctorFormZodSchema}
                                    includeAuthFields={false}
                                />
                                <DoctorProfessionalFields
                                    form={form}
                                    schema={editDoctorFormZodSchema}
                                />
                                <DoctorAddressField
                                    form={form}
                                    schema={editDoctorFormZodSchema}
                                />
                            </div>

                            <form.Field
                                name="specialties"
                                validators={{
                                    onChange: editDoctorFormZodSchema.shape.specialties,
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
                        </div>
                    </ScrollArea>

                    <DialogFooter className="border-t bg-muted/20 px-6 py-3.5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 shrink-0">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                className="w-full sm:w-auto"
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
                                    pendingLabel="Saving changes..."
                                    disabled={!canSubmit || isLoadingSpecialties}
                                    className="w-full sm:w-auto min-w-36"
                                >
                                    Save Changes
                                </AppSubmitButton>
                            )}
                        </form.Subscribe>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditDoctorFormModal;
