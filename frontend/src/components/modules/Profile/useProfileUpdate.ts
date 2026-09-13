import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
    updateAdminProfileAction,
    updateDoctorProfileAction,
    updatePatientProfileAction,
} from "@/app/(dashboardLayout)/(commonProtectedLayout)/my-profile/_action";
import { UserInfo } from "@/types/user.types";

interface UseProfileUpdateProps {
    user: UserInfo;
    avatarFile: File | null;
    onClearAvatarFile: () => void;
    onCancel: () => void;
}

export function useProfileUpdate({
    user,
    avatarFile,
    onClearAvatarFile,
    onCancel,
}: UseProfileUpdateProps) {
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

    return {
        form,
        serverError,
        isPending,
    };
}
