"use client";

import { resetPasswordAction } from "@/app/_actions/auth.actions";
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
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
    IResetPasswordPayload,
    resetPasswordBaseSchema,
    resetPasswordZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ResetPasswordFormProps {
    initialEmail?: string;
}

const ResetPasswordForm = ({
    initialEmail = "",
}: ResetPasswordFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IResetPasswordPayload) =>
            resetPasswordAction(payload),
    });

    const form = useForm({
        defaultValues: {
            email: initialEmail,
            otp: "",
            newPassword: "",
            confirmPassword: "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null);
            const parsed = resetPasswordZodSchema.safeParse(value);
            if (!parsed.success) {
                setServerError(
                    parsed.error.issues[0]?.message || "Validation failed"
                );
                return;
            }

            try {
                const result = await mutateAsync(parsed.data);
                if (result && !result.success) {
                    setServerError(
                        result.message || "Password reset failed"
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
                        : "Password reset failed";
                setServerError(message);
            }
        },
    });

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    Reset Password
                </CardTitle>
                <CardDescription>
                    Enter the 6-digit code sent to your email and your new
                    password.
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
                            onChange: resetPasswordBaseSchema.shape.email,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Email Address"
                                type="email"
                                placeholder="Enter your email"
                                disabled={Boolean(initialEmail)}
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="otp"
                        validators={{
                            onChange: resetPasswordBaseSchema.shape.otp,
                        }}
                    >
                        {(field) => {
                            const error =
                                field.state.meta.isTouched &&
                                field.state.meta.errors.length > 0
                                    ? String(
                                          field.state.meta.errors[0]?.message ||
                                              field.state.meta.errors[0]
                                      )
                                    : null;

                            return (
                                <div className="space-y-2 flex flex-col items-center">
                                    <Label
                                        htmlFor="reset-otp"
                                        className={
                                            error ? "text-destructive" : ""
                                        }
                                    >
                                        6-Digit Verification Code
                                    </Label>
                                    <InputOTP
                                        id="reset-otp"
                                        maxLength={6}
                                        value={field.state.value}
                                        onChange={(val) =>
                                            field.handleChange(val)
                                        }
                                        onBlur={field.handleBlur}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                    {error && (
                                        <p
                                            className="text-sm text-destructive"
                                            role="alert"
                                        >
                                            {error}
                                        </p>
                                    )}
                                </div>
                            );
                        }}
                    </form.Field>

                    <form.Field
                        name="newPassword"
                        validators={{
                            onChange:
                                resetPasswordBaseSchema.shape.newPassword,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="New Password"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password (min. 8 characters)"
                                append={
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword((prev) => !prev)
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="pointer-events-auto"
                                        aria-label={
                                            showNewPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showNewPassword ? (
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
                            onChange: ({ value, fieldApi }) => {
                                if (
                                    value !==
                                    fieldApi.form.getFieldValue("newPassword")
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
                                label="Confirm New Password"
                                type={
                                    showConfirmPassword ? "text" : "password"
                                }
                                placeholder="Confirm your new password"
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
                                        className="pointer-events-auto"
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
                                pendingLabel="Resetting Password..."
                                disabled={!canSubmit}
                            >
                                Reset Password
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

export default ResetPasswordForm;
