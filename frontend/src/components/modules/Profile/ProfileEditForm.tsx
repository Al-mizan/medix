"use client";

import {
    updateAdminProfileAction,
    updateDoctorProfileAction,
    updatePatientProfileAction,
} from "@/app/(dashboardLayout)/(commonProtectedLayout)/my-profile/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserInfo } from "@/types/user.types";
import {
    patientProfileEditSchema,
} from "@/zod/profile.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Building,
    Check,
    DollarSign,
    Lock,
    Stethoscope,
    UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface ProfileEditFormProps {
    user: UserInfo;
    onCancel: () => void;
    avatarFile: File | null;
    onClearAvatarFile: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
    user,
    onCancel,
    avatarFile,
    onClearAvatarFile,
}) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const router = useRouter();

    const patientData = user.patient;
    const doctorData = user.doctor;
    const adminData = user.admin;

    const initialContact =
        patientData?.contactNumber ||
        doctorData?.contactNumber ||
        adminData?.contactNumber ||
        "";

    const initialAddress =
        patientData?.address || doctorData?.address || "";

    const { mutateAsync: updatePatient, isPending: isPatientPending } =
        useMutation({
            mutationFn: updatePatientProfileAction,
        });

    const { mutateAsync: updateDoctor, isPending: isDoctorPending } =
        useMutation({
            mutationFn: (payload: {
                name: string;
                contactNumber?: string;
                address?: string;
            }) => {
                const doctorId = user.doctor?.id;
                if (!doctorId) throw new Error("Doctor ID not found");
                return updateDoctorProfileAction(doctorId, payload);
            },
        });

    const { mutateAsync: updateAdmin, isPending: isAdminPending } = useMutation({
        mutationFn: (payload: { name: string; contactNumber?: string }) => {
            const adminId = user.admin?.id;
            if (!adminId) throw new Error("Admin ID not found");
            return updateAdminProfileAction(adminId, payload);
        },
    });

    const isPending = isPatientPending || isDoctorPending || isAdminPending;

    const form = useForm({
        defaultValues: {
            name: user.name || "",
            contactNumber: initialContact,
            address: initialAddress,
        },
        onSubmit: async ({ value }) => {
            setServerError(null);

            try {
                if (user.role === "PATIENT") {
                    const formData = new FormData();
                    formData.append(
                        "data",
                        JSON.stringify({
                            patientInfo: {
                                name: value.name,
                                contactNumber: value.contactNumber || undefined,
                                address: value.address || undefined,
                            },
                        })
                    );

                    if (avatarFile) {
                        formData.append("profilePhoto", avatarFile);
                    }

                    const result = await updatePatient(formData);
                    if (!result.success) {
                        setServerError(result.message || "Failed to update profile");
                        return;
                    }
                } else if (user.role === "DOCTOR") {
                    const result = await updateDoctor({
                        name: value.name,
                        contactNumber: value.contactNumber || undefined,
                        address: value.address || undefined,
                    });
                    if (!result.success) {
                        setServerError(
                            result.message || "Failed to update doctor profile"
                        );
                        return;
                    }
                } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                    const result = await updateAdmin({
                        name: value.name,
                        contactNumber: value.contactNumber || undefined,
                    });
                    if (!result.success) {
                        setServerError(
                            result.message || "Failed to update admin profile"
                        );
                        return;
                    }
                }

                toast.success("Profile updated successfully!");
                onClearAvatarFile();
                await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
                router.refresh();
                onCancel();
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "Failed to save profile";
                setServerError(message);
            }
        },
    });

    return (
        <form
            method="POST"
            action="#"
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-6"
        >
            <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <UserCheck className="size-5 text-[#0B7285]" />
                        <CardTitle className="text-lg font-semibold">
                            Edit Profile Details
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Update your editable personal information and contact credentials.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Avatar preview banner if file selected */}
                    {avatarFile && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#E1F3F6] border border-[#0B7285]/20 text-xs text-[#075463]">
                            <span className="font-medium flex items-center gap-1.5">
                                <Check className="size-4 text-[#178A5E]" />
                                New profile photo selected: {avatarFile.name}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClearAvatarFile}
                                className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                            >
                                Remove
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <form.Field
                            name="name"
                            validators={{
                                onChange: patientProfileEditSchema.shape.name,
                            }}
                        >
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                />
                            )}
                        </form.Field>

                        {/* Email (Read only) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    Email Address
                                </Label>
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 text-muted-foreground border-border"
                                >
                                    Fixed
                                </Badge>
                            </div>
                            <Input
                                value={user.email}
                                disabled
                                className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                            />
                        </div>

                        {/* Contact Number */}
                        <form.Field
                            name="contactNumber"
                            validators={{
                                onChange:
                                    patientProfileEditSchema.shape.contactNumber,
                            }}
                        >
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Contact Number"
                                    type="text"
                                    placeholder="e.g. +8801700000000"
                                />
                            )}
                        </form.Field>

                        {/* Address (Patient and Doctor) */}
                        {(user.role === "PATIENT" || user.role === "DOCTOR") && (
                            <form.Field
                                name="address"
                                validators={{
                                    onChange:
                                        patientProfileEditSchema.shape.address,
                                }}
                            >
                                {(field) => (
                                    <AppField
                                        field={field}
                                        label="Address"
                                        placeholder="City, State, Country"
                                    />
                                )}
                            </form.Field>
                        )}
                    </div>

                    {/* Informative Read-Only Clinical Details for Doctors */}
                    {user.role === "DOCTOR" && doctorData && (
                        <div className="pt-4 space-y-4">
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="size-4 text-[#0B7285]" />
                                    <h4 className="text-sm font-semibold text-foreground">
                                        Clinical Credentials (Read-Only)
                                    </h4>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Lock className="size-3" />
                                    <span>Managed by Hospital Admin</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                                    <span className="text-muted-foreground">Designation</span>
                                    <p className="font-medium text-foreground">
                                        {doctorData.designation || "Doctor"}
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                                    <span className="text-muted-foreground">Qualification</span>
                                    <p className="font-medium text-foreground">
                                        {doctorData.qualification || "MBBS"}
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Building className="size-3" /> Workplace
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {doctorData.currentWorkingPlace || "Not specified"}
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                                    <span className="text-muted-foreground">License No.</span>
                                    <p className="font-medium font-mono text-foreground">
                                        {doctorData.registrationNumber || "Not specified"}
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <DollarSign className="size-3" /> Consultation Fee
                                    </span>
                                    <p className="font-medium text-foreground">
                                        ${doctorData.appointmentFee ?? 0}
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                                    <span className="text-muted-foreground">Experience</span>
                                    <p className="font-medium text-foreground">
                                        {doctorData.experience ?? 0} years
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isPending}
                        className="border-border hover:bg-muted"
                    >
                        Cancel
                    </Button>

                    <form.Subscribe
                        selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <AppSubmitButton
                                isPending={isSubmitting || isPending}
                                pendingLabel="Saving..."
                                disabled={!canSubmit}
                                className="w-auto px-6 bg-[#0B7285] hover:bg-[#095E70] text-white"
                            >
                                Save Changes
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </CardFooter>
            </Card>
        </form>
    );
};

export default ProfileEditForm;
