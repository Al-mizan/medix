"use client";

import { changePasswordAction } from "@/app/_actions/auth.actions";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    IChangePasswordPayload,
    changePasswordBaseSchema,
    changePasswordZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Check, Eye, EyeOff, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const defaultValues: IChangePasswordPayload = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

const ChangePasswordForm = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IChangePasswordPayload) =>
            changePasswordAction(payload),
    });

    const form = useForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            setServerError(null);
            const parsed = changePasswordZodSchema.safeParse(value);
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
                        result.message || "Failed to change password"
                    );
                    return;
                }

                toast.success("Password changed successfully!");
                form.reset();
            } catch (error: unknown) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to change password";
                setServerError(message);
            }
        },
    });

    return (
        <Card className="w-full max-w-xl mx-auto shadow-sm border border-border bg-card">
            <CardHeader className="space-y-3 pb-6 border-b">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-[#E1F3F6] text-[#0B7285] flex items-center justify-center shrink-0">
                        <KeyRound className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-semibold text-foreground">
                            Update Password
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Choose a strong, unique password with at least 8 characters.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
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
                    {/* Current Password */}
                    <form.Field
                        name="currentPassword"
                        validators={{
                            onChange: changePasswordBaseSchema.shape.currentPassword,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Current Password"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter your current password"
                                append={
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrentPassword((prev) => !prev)
                                        }
                                        variant="ghost"
                                        size="icon"
                                        className="pointer-events-auto"
                                        aria-label={
                                            showCurrentPassword
                                                ? "Hide current password"
                                                : "Show current password"
                                        }
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                }
                            />
                        )}
                    </form.Field>

                    {/* New Password */}
                    <form.Field
                        name="newPassword"
                        validators={{
                            onChange: changePasswordBaseSchema.shape.newPassword,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="New Password"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter at least 8 characters"
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
                                                ? "Hide new password"
                                                : "Show new password"
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

                    {/* Confirm New Password */}
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
                                type={showConfirmPassword ? "text" : "password"}
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
                                                ? "Hide confirm password"
                                                : "Show confirm password"
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

                    {/* Live Password Rules Indicator */}
                    <form.Subscribe
                        selector={(state) => ({
                            newPassword: state.values.newPassword,
                            confirmPassword: state.values.confirmPassword,
                        })}
                    >
                        {({ newPassword, confirmPassword }) => {
                            const hasMinLength = (newPassword || "").length >= 8;
                            const isMatching =
                                Boolean(newPassword) &&
                                Boolean(confirmPassword) &&
                                newPassword === confirmPassword;

                            return (
                                <div className="rounded-lg bg-muted/40 p-3.5 text-xs space-y-2 border border-border/60">
                                    <p className="font-medium text-muted-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="size-3.5 text-[#0B7285]" />
                                        Password Checklist:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                                        <span
                                            className={`flex items-center gap-1.5 ${
                                                hasMinLength
                                                    ? "text-[#178A5E] font-medium"
                                                    : ""
                                            }`}
                                        >
                                            <Check
                                                className={`size-3.5 ${
                                                    hasMinLength
                                                        ? "text-[#178A5E]"
                                                        : "opacity-40"
                                                }`}
                                            />
                                            At least 8 characters
                                        </span>
                                        <span
                                            className={`flex items-center gap-1.5 ${
                                                isMatching
                                                    ? "text-[#178A5E] font-medium"
                                                    : ""
                                            }`}
                                        >
                                            <Check
                                                className={`size-3.5 ${
                                                    isMatching
                                                        ? "text-[#178A5E]"
                                                        : "opacity-40"
                                                }`}
                                            />
                                            Passwords match
                                        </span>
                                    </div>
                                </div>
                            );
                        }}
                    </form.Subscribe>

                    {serverError && (
                        <Alert variant="destructive" className="py-2.5">
                            <ShieldAlert className="size-4" />
                            <AlertDescription className="text-sm font-medium">
                                {serverError}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="pt-2">
                        <form.Subscribe
                            selector={(s) =>
                                [s.canSubmit, s.isSubmitting] as const
                            }
                        >
                            {([canSubmit, isSubmitting]) => (
                                <AppSubmitButton
                                    isPending={isSubmitting || isPending}
                                    pendingLabel="Updating Password..."
                                    disabled={!canSubmit}
                                    className="w-full bg-[#0B7285] hover:bg-[#095E70] text-white font-medium"
                                >
                                    Save New Password
                                </AppSubmitButton>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ChangePasswordForm;
