"use client";

import { resendOtpAction, verifyEmailAction } from "@/app/_actions/auth.actions";
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
    IVerifyEmailPayload,
    verifyEmailZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VerifyEmailFormProps {
    initialEmail?: string;
}

const VerifyEmailForm = ({ initialEmail = "" }: VerifyEmailFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
    const [countdown, setCountdown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IVerifyEmailPayload) =>
            verifyEmailAction(payload),
    });

    const form = useForm({
        defaultValues: {
            email: initialEmail,
            otp: "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null);
            const parsed = verifyEmailZodSchema.safeParse(value);
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
                        result.message || "Email verification failed"
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
                        : "Verification failed";
                setServerError(message);
            }
        },
    });

    const handleResendOtp = async () => {
        if (countdown > 0 || isResending) return;
        const currentEmail = form.getFieldValue("email");
        if (!currentEmail) {
            toast.error("Please provide an email address first");
            return;
        }

        setIsResending(true);
        try {
            const result = await resendOtpAction(currentEmail);
            if (result.success) {
                toast.success(
                    result.message || "Verification OTP resent successfully"
                );
                setCountdown(60);
            } else {
                toast.error(result.message || "Failed to resend OTP");
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Failed to resend OTP";
            toast.error(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    Verify Your Email
                </CardTitle>
                <CardDescription>
                    Please enter the 6-digit verification code sent to your email
                    address.
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
                    className="space-y-5"
                >
                    <form.Subscribe selector={(s) => s.values.email}>
                        {(currentEmail) => (
                            <>
                                {!isEditingEmail ? (
                                    <div className="rounded-lg border p-3.5 bg-muted/40 flex items-center justify-between">
                                        <div className="space-y-0.5 overflow-hidden pr-2">
                                            <p className="text-xs text-muted-foreground font-medium">
                                                Code sent to
                                            </p>
                                            <p className="text-sm font-semibold truncate">
                                                {currentEmail || "No email specified"}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setIsEditingEmail(true)
                                            }
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <form.Field
                                            name="email"
                                            validators={{
                                                onChange:
                                                    verifyEmailZodSchema.shape
                                                        .email,
                                            }}
                                        >
                                            {(field) => (
                                                <AppField
                                                    field={field}
                                                    label="Email Address"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                />
                                            )}
                                        </form.Field>
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setIsEditingEmail(false)
                                                }
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </form.Subscribe>

                    <form.Field
                        name="otp"
                        validators={{
                            onChange: verifyEmailZodSchema.shape.otp,
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
                                        htmlFor="otp"
                                        className={
                                            error ? "text-destructive" : ""
                                        }
                                    >
                                        6-Digit Verification Code
                                    </Label>
                                    <InputOTP
                                        id="otp"
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

                    <div className="flex items-center justify-between text-sm pt-1">
                        <span className="text-muted-foreground">
                            Didn&apos;t receive code?
                        </span>
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto font-medium"
                            disabled={countdown > 0 || isResending}
                            onClick={handleResendOtp}
                        >
                            {countdown > 0
                                ? `Resend in ${countdown}s`
                                : isResending
                                ? "Sending..."
                                : "Resend OTP"}
                        </Button>
                    </div>

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
                                pendingLabel="Verifying..."
                                disabled={!canSubmit}
                            >
                                Verify Email
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

export default VerifyEmailForm;
