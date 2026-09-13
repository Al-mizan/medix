import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { updateDoctorAction } from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_action";
import { Gender, type IDoctor, type IUpdateDoctorPayload } from "@/types/doctor.types";
import { type IEditDoctorFormValues } from "@/zod/doctor.validation";

const getInitialValues = (doctor: IDoctor | null): IEditDoctorFormValues => ({
    name: doctor?.name ?? "",
    contactNumber: doctor?.contactNumber ?? "",
    address: doctor?.address ?? "",
    registrationNumber: doctor?.registrationNumber ?? "",
    experience: doctor?.experience?.toString() ?? "",
    gender: doctor?.gender === Gender.FEMALE ? Gender.FEMALE : Gender.MALE,
    appointmentFee: doctor?.appointmentFee?.toString() ?? "",
    qualification: doctor?.qualification ?? "",
    currentWorkingPlace: doctor?.currentWorkingPlace ?? "",
    designation: doctor?.designation ?? "",
    specialties: doctor?.specialties?.map((item) => item.specialty.id) ?? [],
});

export function useEditDoctorForm({
    doctor,
    open,
    onSuccess,
}: {
    doctor: IDoctor | null;
    open: boolean;
    onSuccess: () => void;
}) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({
            doctorId,
            payload,
        }: {
            doctorId: string;
            payload: IUpdateDoctorPayload;
        }) => updateDoctorAction(doctorId, payload),
    });

    const form = useForm({
        defaultValues: getInitialValues(doctor),
        onSubmit: async ({ value }) => {
            if (!doctor) {
                toast.error("Doctor not found");
                return;
            }

            const originalSpecialtyIds = new Set(
                doctor.specialties.map((item) => item.specialty.id),
            );
            const nextSpecialtyIds = new Set(value.specialties);

            const specialtyChanges: IUpdateDoctorPayload["specialties"] = [];

            nextSpecialtyIds.forEach((specialtyId) => {
                if (!originalSpecialtyIds.has(specialtyId)) {
                    specialtyChanges.push({ specialtyId, shouldDelete: false });
                }
            });

            originalSpecialtyIds.forEach((specialtyId) => {
                if (!nextSpecialtyIds.has(specialtyId)) {
                    specialtyChanges.push({ specialtyId, shouldDelete: true });
                }
            });

            const payload: IUpdateDoctorPayload = {
                doctor: {
                    name: value.name,
                    contactNumber: value.contactNumber,
                    address: value.address,
                    registrationNumber: value.registrationNumber,
                    experience: value.experience
                        ? Number(value.experience)
                        : undefined,
                    gender: value.gender,
                    appointmentFee: Number(value.appointmentFee),
                    qualification: value.qualification,
                    currentWorkingPlace: value.currentWorkingPlace,
                    designation: value.designation,
                },
                ...(specialtyChanges.length > 0
                    ? { specialties: specialtyChanges }
                    : {}),
            };

            const result = await mutateAsync({
                doctorId: String(doctor.id),
                payload,
            });

            if (!result.success) {
                toast.error(result.message || "Failed to update doctor");
                return;
            }

            toast.success(result.message || "Doctor updated successfully");
            onSuccess();

            void queryClient.invalidateQueries({ queryKey: ["doctors"] });
            void queryClient.refetchQueries({
                queryKey: ["doctors"],
                type: "active",
            });
            router.refresh();
        },
    });

    useEffect(() => {
        if (open) {
            form.reset(getInitialValues(doctor));
        }
    }, [doctor, form, open]);

    return {
        form,
        isPending,
    };
}
