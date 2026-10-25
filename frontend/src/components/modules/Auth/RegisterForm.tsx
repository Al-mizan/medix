"use client";

import { registerAction } from "@/app/_actions/auth.actions";
import GoogleSignInButton from "@/components/modules/Auth/GoogleSignInButton";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    IRegisterPayload,
    registerBaseSchema,
    registerZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const RegisterForm = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IRegisterPayload) => registerAction(payload),
    });

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            contactNumber: "",
            password: "",
            confirmPassword: "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null);
            const parsed = registerZodSchema.safeParse(value);
            if (!parsed.success) {
                setServerError(
                    parsed.error.issues[0]?.message || "Validation failed"
                );
                return;
            }

            try {
                const result = await mutateAsync(parsed.data);

                if (result && !result.success) {
                    setServerError(result.message || "Registration failed");
                    return;
                }
            } catch (error: unknown) {
                if (
                    error &&
                    typeof error === "object" &&
                    "digest" in error &&
                    typeof (error as { digest: unknown }).digest === "string" &&
                    (error as { digest: string }).digest.startsWith(
                        "NEXT_REDIRECT"
                    )
                ) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Registration failed";
                setServerError(message);
            }
        },
    });

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <CardTitle as="h1" className="text-2xl font-bold">
                    Create an Account
                </CardTitle>
                <CardDescription>
                    Enter your details below to create your patient account.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    method="POST"
                    action="#"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <form.Field
                        name="name"
                        validators={{
                            onChange: registerBaseSchema.shape.name,
                            onBlur: registerBaseSchema.shape.name,
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

                    <form.Field
                        name="email"
                        validators={{
                            onChange: registerBaseSchema.shape.email,
                            onBlur: registerBaseSchema.shape.email,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="contactNumber"
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Contact Number (Optional)"
                                placeholder="e.g. +1234567890"
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="password"
                        validators={{
                            onChange: registerBaseSchema.shape.password,
                            onBlur: registerBaseSchema.shape.password,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password (min. 8 characters)"
                                append={
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="pointer-events-auto hover:bg-transparent"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                             <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                }
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="confirmPassword"
                        validators={{
                            onChangeListenTo: ["password"],
                            onChange: ({ value, fieldApi }) => {
                                if (!value) return "Please confirm your password";
                                if (
                                    value !==
                                    fieldApi.form.getFieldValue("password")
                                ) {
                                    return "Passwords do not match";
                                }
                                return undefined;
                            },
                            onBlur: ({ value, fieldApi }) => {
                                if (!value) return "Please confirm your password";
                                if (
                                    value !==
                                    fieldApi.form.getFieldValue("password")
                                ) {
                                    return "Passwords do not match";
                                }
                                return undefined;
                            },
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                append={
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="pointer-events-auto hover:bg-transparent"
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                }
                            />
                        )}
                    </form.Field>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <form.Subscribe
                        selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <AppSubmitButton
                                isPending={isSubmitting || isPending}
                                pendingLabel="Creating Account..."
                                disabled={!canSubmit}
                            >
                                Create Account
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>

                <GoogleSignInButton label="Sign up with Google" />
            </CardContent>

            <CardFooter className="justify-center border-t pt-4">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-primary font-medium hover:underline underline-offset-4"
                    >
                        Log In
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
};

export default RegisterForm;
