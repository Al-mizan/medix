"use client";

import { forgotPasswordAction } from "@/app/_actions/auth.actions";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    IForgotPasswordPayload,
    forgotPasswordZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ForgotPasswordForm = () => {
    const [serverError, setServerError] = useState<string | null>(null);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IForgotPasswordPayload) =>
            forgotPasswordAction(payload),
    });

    const form = useForm({
        defaultValues: {
            email: "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null);
            const parsed = forgotPasswordZodSchema.safeParse(value);
            if (!parsed.success) {
                setServerError(
                    parsed.error.issues[0]?.message || "Invalid email address"
                );
                return;
            }

            try {
                const result = await mutateAsync(parsed.data);
                if (result && !result.success) {
                    setServerError(
                        result.message || "Failed to send reset code"
                    );
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
                        : "Failed to send reset code";
                setServerError(message);
            }
        },
    });

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    Forgot Password?
                </CardTitle>
                <CardDescription>
                    Enter your registered email address and we will send you a
                    verification code to reset your password.
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
                        name="email"
                        validators={{
                            onChange: forgotPasswordZodSchema.shape.email,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Email Address"
                                type="email"
                                placeholder="Enter your registered email"
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
                                pendingLabel="Sending Code..."
                                disabled={!canSubmit}
                            >
                                Send Reset Code
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>

            <CardFooter className="justify-center border-t pt-4">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline underline-offset-4"
                >
                    <ArrowLeft className="size-4" />
                    Back to Log In
                </Link>
            </CardFooter>
        </Card>
    );
};

export default ForgotPasswordForm;
