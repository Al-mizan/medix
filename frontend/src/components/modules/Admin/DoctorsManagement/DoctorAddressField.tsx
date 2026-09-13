import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DoctorAddressFieldProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: any;
}

export default function DoctorAddressField({ form, schema }: DoctorAddressFieldProps) {
    return (
        <form.Field
            name="address"
            validators={{
                onChange: schema.shape.address,
            }}
        >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => {
                const firstError =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null;

                return (
                    <div className="space-y-1.5 md:col-span-2">
                        <Label
                            htmlFor={field.name}
                            className={cn(firstError && "text-destructive")}
                        >
                            Address
                        </Label>
                        <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            placeholder="Enter doctor address"
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                                field.handleChange(event.target.value)
                            }
                            aria-invalid={!!firstError}
                            className={cn(
                                firstError && "border-destructive focus-visible:ring-destructive"
                            )}
                        />
                        {firstError && (
                            <p className="text-sm text-destructive">
                                {typeof firstError === "object" && "message" in firstError
                                    ? String(firstError.message)
                                    : String(firstError)}
                            </p>
                        )}
                    </div>
                );
            }}
        </form.Field>
    );
}
