import AppField from "@/components/shared/form/AppField";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Gender } from "@/types/doctor.types";
import { cn } from "@/lib/utils";

interface DoctorProfessionalFieldsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: any;
}

export default function DoctorProfessionalFields({ form, schema }: DoctorProfessionalFieldsProps) {
    return (
        <>
            <form.Field
                name="registrationNumber"
                validators={{
                    onChange: schema.shape.registrationNumber,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Registration Number"
                        placeholder="Enter registration number"
                    />
                )}
            </form.Field>

            <form.Field
                name="experience"
                validators={{
                    onChange: schema.shape.experience,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Experience"
                        type="number"
                        placeholder="Years of experience"
                    />
                )}
            </form.Field>

            <form.Field
                name="appointmentFee"
                validators={{
                    onChange: schema.shape.appointmentFee,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Appointment Fee"
                        type="number"
                        placeholder="Enter appointment fee"
                    />
                )}
            </form.Field>

            <form.Field
                name="qualification"
                validators={{
                    onChange: schema.shape.qualification,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Qualification"
                        placeholder="e.g. MBBS, FCPS"
                    />
                )}
            </form.Field>

            <form.Field
                name="currentWorkingPlace"
                validators={{
                    onChange: schema.shape.currentWorkingPlace,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Current Working Place"
                        placeholder="Enter current workplace"
                    />
                )}
            </form.Field>

            <form.Field
                name="designation"
                validators={{
                    onChange: schema.shape.designation,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Designation"
                        placeholder="e.g. Consultant, Professor"
                    />
                )}
            </form.Field>

            <form.Field
                name="gender"
                validators={{
                    onChange: schema.shape.gender,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => {
                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                    return (
                        <div className="space-y-2">
                            <Label htmlFor="gender-select">Gender</Label>
                            <Select
                                value={field.state.value}
                                onValueChange={(val) => field.handleChange(val as Gender)}
                            >
                                <SelectTrigger
                                    id="gender-select"
                                    className={cn(
                                        "w-full",
                                        hasError && "border-destructive focus-visible:ring-destructive"
                                    )}
                                >
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={Gender.MALE}>Male</SelectItem>
                                    <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasError && (
                                <p className="text-sm text-destructive">
                                    {String(field.state.meta.errors[0]?.message || field.state.meta.errors[0])}
                                </p>
                            )}
                        </div>
                    );
                }}
            </form.Field>
        </>
    );
}
