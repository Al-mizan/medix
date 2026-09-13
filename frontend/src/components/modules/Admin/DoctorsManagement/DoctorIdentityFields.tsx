import AppField from "@/components/shared/form/AppField";

interface DoctorIdentityFieldsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: any;
    includeAuthFields?: boolean;
}

export default function DoctorIdentityFields({
    form,
    schema,
    includeAuthFields = false,
}: DoctorIdentityFieldsProps) {
    return (
        <>
            <form.Field
                name="name"
                validators={{
                    onChange: schema.shape.name,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Full Name"
                        placeholder="Enter full name"
                    />
                )}
            </form.Field>

            {includeAuthFields && (
                <>
                    <form.Field
                        name="email"
                        validators={{
                            onChange: schema.shape.email,
                        }}
                    >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(field: any) => (
                            <AppField
                                field={field}
                                label="Email"
                                type="email"
                                placeholder="doctor@example.com"
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="password"
                        validators={{
                            onChange: schema.shape.password,
                        }}
                    >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(field: any) => (
                            <AppField
                                field={field}
                                label="Password"
                                type="password"
                                placeholder="Enter temporary password"
                            />
                        )}
                    </form.Field>
                </>
            )}

            <form.Field
                name="contactNumber"
                validators={{
                    onChange: schema.shape.contactNumber,
                }}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => (
                    <AppField
                        field={field}
                        label="Contact Number"
                        placeholder="Enter contact number"
                    />
                )}
            </form.Field>
        </>
    );
}
