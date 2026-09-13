import React from "react";
import AppField from "@/components/shared/form/AppField";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patientProfileEditSchema } from "@/zod/profile.validation";
import { UserRole } from "@/lib/authUtils";

interface ProfileEditFormFieldsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    email: string;
    role: UserRole;
}

export default function ProfileEditFormFields({
    form,
    email,
    role,
}: ProfileEditFormFieldsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <form.Field
                name="name"
                validators={{
                    onChange: patientProfileEditSchema.shape.name,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
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
                    value={email}
                    disabled
                    className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                />
            </div>

            {/* Contact Number */}
            <form.Field
                name="contactNumber"
                validators={{
                    onChange: patientProfileEditSchema.shape.contactNumber,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Contact Number"
                        type="text"
                        placeholder="e.g. +8801700000000"
                    />
                )}
            </form.Field>

            {/* Address (Patient and Doctor) */}
            {(role === "PATIENT" || role === "DOCTOR") && (
                <form.Field
                    name="address"
                    validators={{
                        onChange: patientProfileEditSchema.shape.address,
                    }}
                >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => (
                        <AppField
                            field={field}
                            label="Address"
                            placeholder="City, State, Country"
                        />
                    )}
                </form.Field>
            )}
        </div>
    );
}
