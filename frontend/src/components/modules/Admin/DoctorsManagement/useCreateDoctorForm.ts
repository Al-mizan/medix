import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { createDoctorAction } from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_action";
import { Gender } from "@/types/doctor.types";
import { type ICreateDoctorFormValues } from "@/zod/doctor.validation";

const defaultValues: ICreateDoctorFormValues = {
    password: "",
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    registrationNumber: "",
    experience: "",
    gender: Gender.MALE,
    appointmentFee: "",
    qualification: "",
    currentWorkingPlace: "",
    designation: "",
    specialties: [],
};

export const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return "Invalid input";
};

export function useCreateDoctorForm({
    onSuccess,
}: {
    onSuccess: () => void;
}) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: createDoctorAction,
    });

    const form = useForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            const payload = {
                password: value.password,
                doctor: {
                    name: value.name,
                    email: value.email,
                    contactNumber: value.contactNumber,
                    address: value.address,
                    registrationNumber: value.registrationNumber,
                    experience: Number(value.experience),
                    gender: value.gender,
                    appointmentFee: Number(value.appointmentFee),
                    qualification: value.qualification,
                    currentWorkingPlace: value.currentWorkingPlace,
                    designation: value.designation,
                },
                specialties: value.specialties,
            };

            const result = await mutateAsync(payload);

            if (!result.success) {
                toast.error(result.message || "Failed to create doctor");
                return;
            }

            toast.success("Doctor created successfully");
            form.reset();
            onSuccess();
            void queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
            router.refresh();
        },
    });

    const handleOpenChange = useCallback(
        (nextOpen: boolean, setOpen: (open: boolean) => void) => {
            setOpen(nextOpen);
            if (!nextOpen) {
                form.reset();
            }
        },
        [form],
    );

    return {
        form,
        isPending,
        handleOpenChange,
    };
}
