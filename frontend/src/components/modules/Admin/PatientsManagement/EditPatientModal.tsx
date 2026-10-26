"use client";

import { updatePatientByAdminAction } from "@/app/(dashboardLayout)/admin/dashboard/patients-management/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type IPatient } from "@/types/patient.types";
import {
    adminUpdatePatientFormSchema,
    type IAdminUpdatePatientFormValues,
} from "@/zod/patient.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Mail, UserCheck, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EditPatientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: IPatient | null;
}

const getInitValues = (patient: IPatient | null): IAdminUpdatePatientFormValues => ({
    name: patient?.name || "",
    contactNumber: patient?.contactNumber || "",
    address: patient?.address || "",
    status: (patient?.user?.status === "BLOCKED" ? "BLOCKED" : "ACTIVE") as "ACTIVE" | "BLOCKED",
});

const EditPatientModal = ({
    open,
    onOpenChange,
    patient,
}: EditPatientModalProps) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: IAdminUpdatePatientFormValues;
        }) =>
            updatePatientByAdminAction(id, {
                name: payload.name,
                contactNumber: payload.contactNumber || undefined,
                address: payload.address || undefined,
                status: payload.status,
            }),
    });

    const form = useForm({
        defaultValues: getInitValues(patient),
        onSubmit: async ({ value }) => {
            if (!patient) return;

            const result = await mutateAsync({
                id: patient.id,
                payload: value,
            });

            if (!result.success) {
                toast.error(result.message || "Failed to update patient profile");
                return;
            }

            toast.success("Patient updated successfully");
            await queryClient.invalidateQueries({ queryKey: ["patients"] });
            onOpenChange(false);
        },
    });

    useEffect(() => {
        if (patient) {
            form.reset(getInitValues(patient));
        }
    }, [patient, form]);

    if (!patient) return null;

    const formattedJoinDate = patient.createdAt
        ? format(new Date(patient.createdAt), "MMM dd, yyyy")
        : "N/A";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0 flex flex-col">
                <DialogHeader className="border-b px-6 py-4 shrink-0">
                    <DialogTitle className="text-lg font-semibold tracking-tight">Edit Patient</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Update personal details and manage account status for {patient.name}.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-8.5rem)] overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                        {/* Patient Summary Header Card */}
                        <div className="flex items-center gap-3.5 p-3.5 bg-muted/40 rounded-lg border border-border/80">
                            <Avatar className="h-12 w-12 border border-border/80 shadow-xs shrink-0">
                                <AvatarImage
                                    src={patient.profilePhoto || undefined}
                                    alt={patient.name}
                                />
                                <AvatarFallback className="font-semibold text-primary">
                                    {patient.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-semibold text-foreground truncate">
                                    {patient.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                    <Mail className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                    <span className="truncate">{patient.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                                    <Calendar className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                    <span>Joined on {formattedJoinDate}</span>
                                </div>
                            </div>
                        </div>

                        <form
                            id="edit-patient-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                form.handleSubmit();
                            }}
                            className="space-y-4 pt-1"
                        >
                            <form.Field
                                name="name"
                                validators={{
                                    onChange: ({ value }) => {
                                        const parsed =
                                            adminUpdatePatientFormSchema.shape.name.safeParse(
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
                                        placeholder="e.g. John Doe"
                                    />
                                )}
                            </form.Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form.Field
                                    name="contactNumber"
                                    validators={{
                                        onChange: ({ value }) => {
                                            const parsed =
                                                adminUpdatePatientFormSchema.shape.contactNumber.safeParse(
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

                                <form.Field name="status">
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="patient-status">Account Status</Label>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(val: "ACTIVE" | "BLOCKED") =>
                                                    field.handleChange(val)
                                                }
                                            >
                                                <SelectTrigger id="patient-status" className="h-9">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE">
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                            <span>Active</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="BLOCKED">
                                                        <div className="flex items-center gap-2">
                                                            <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                                                            <span>Blocked</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </form.Field>
                            </div>

                            <form.Field
                                name="address"
                                validators={{
                                    onChange: ({ value }) => {
                                        const parsed =
                                            adminUpdatePatientFormSchema.shape.address.safeParse(
                                                value
                                            );
                                        return parsed.success
                                            ? undefined
                                            : parsed.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="patient-address">Address</Label>
                                        <Textarea
                                            id="patient-address"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="e.g. Apt 4B, Dhanmondi, Dhaka"
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

                            {/* Medical records integrity note */}
                            <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground leading-relaxed">
                                <span className="font-semibold text-foreground">Clinical Notice:</span> Medical reports, biometrics, and longitudinal health records are self-managed by the patient or certified doctors. Administrative edits are constrained to identity & account access governance.
                            </div>
                        </form>
                    </div>
                </ScrollArea>

                <DialogFooter className="border-t bg-muted/20 px-6 py-3.5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 shrink-0">
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
                    <AppSubmitButton
                        form="edit-patient-form"
                        isPending={isPending}
                        label="Save Changes"
                        className="w-full sm:w-auto"
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditPatientModal;
