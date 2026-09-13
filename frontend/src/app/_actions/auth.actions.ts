"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import {
    changePasswordService,
    forgotPasswordService,
    logoutUserService,
    registerPatientService,
    resendOtpService,
    resetPasswordService,
    verifyEmailService,
} from "@/services/auth.services";
import {
    IChangePasswordPayload,
    IForgotPasswordPayload,
    IRegisterPayload,
    IResetPasswordPayload,
    IVerifyEmailPayload,
    changePasswordZodSchema,
    forgotPasswordZodSchema,
    registerZodSchema,
    resetPasswordZodSchema,
    verifyEmailZodSchema,
} from "@/zod/auth.validation";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const isRedirectError = (error: unknown): boolean => {
    return Boolean(
        error &&
            typeof error === "object" &&
            "digest" in error &&
            typeof (error as { digest: unknown }).digest === "string" &&
            (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    );
};

export const registerAction = async (
    payload: IRegisterPayload
): Promise<{ success: boolean; message: string } | void> => {
    const parsedPayload = registerZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Invalid input";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        const response = await registerPatientService({
            name: parsedPayload.data.name,
            email: parsedPayload.data.email,
            password: parsedPayload.data.password,
            contactNumber: parsedPayload.data.contactNumber,
        });

        const tokenData = response?.data;
        if (tokenData?.accessToken) {
            await setTokenInCookies("accessToken", tokenData.accessToken);
        }
        if (tokenData?.refreshToken) {
            await setTokenInCookies("refreshToken", tokenData.refreshToken);
        }
        if (tokenData?.token) {
            await setTokenInCookies(
                "better-auth.session_token",
                tokenData.token,
                24 * 60 * 60
            );
        }

        redirect(
            `/verify-email?email=${encodeURIComponent(parsedPayload.data.email)}`
        );
    } catch (error: unknown) {
        if (isRedirectError(error)) {
            throw error;
        }

        const message =
            error instanceof Error ? error.message : "Registration failed";
        return {
            success: false,
            message,
        };
    }
};

export const verifyEmailAction = async (
    payload: IVerifyEmailPayload
): Promise<{ success: boolean; message: string } | void> => {
    const parsedPayload = verifyEmailZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Invalid input";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        await verifyEmailService({
            email: parsedPayload.data.email,
            otp: parsedPayload.data.otp,
        });

        redirect("/login");
    } catch (error: unknown) {
        if (isRedirectError(error)) {
            throw error;
        }

        const message =
            error instanceof Error ? error.message : "Verification failed";
        return {
            success: false,
            message,
        };
    }
};

export const resendOtpAction = async (
    email: string
): Promise<{ success: boolean; message: string }> => {
    const emailValidation = z.email().safeParse(email);
    if (!emailValidation.success) {
        return {
            success: false,
            message: "Invalid email address",
        };
    }

    try {
        const response = await resendOtpService(email);
        return {
            success: true,
            message: response?.message || "Verification OTP resent successfully",
        };
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to resend OTP";
        return {
            success: false,
            message,
        };
    }
};

export const forgotPasswordAction = async (
    payload: IForgotPasswordPayload
): Promise<{ success: boolean; message: string } | void> => {
    const parsedPayload = forgotPasswordZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Invalid email address";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        await forgotPasswordService(parsedPayload.data.email);

        redirect(
            `/reset-password?email=${encodeURIComponent(parsedPayload.data.email)}`
        );
    } catch (error: unknown) {
        if (isRedirectError(error)) {
            throw error;
        }

        const message =
            error instanceof Error ? error.message : "Failed to send reset code";
        return {
            success: false,
            message,
        };
    }
};

export const resetPasswordAction = async (
    payload: IResetPasswordPayload
): Promise<{ success: boolean; message: string } | void> => {
    const parsedPayload = resetPasswordZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Invalid input";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        await resetPasswordService({
            email: parsedPayload.data.email,
            otp: parsedPayload.data.otp,
            newPassword: parsedPayload.data.newPassword,
        });

        redirect("/login");
    } catch (error: unknown) {
        if (isRedirectError(error)) {
            throw error;
        }

        const message =
            error instanceof Error ? error.message : "Password reset failed";
        return {
            success: false,
            message,
        };
    }
};

export const logoutAction = async (): Promise<void> => {
    try {
        await logoutUserService();
    } catch (error) {
        console.error("Logout error in backend call:", error);
    }

    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("better-auth.session_token");

    redirect("/login");
};

export const changePasswordAction = async (
    payload: IChangePasswordPayload
): Promise<{ success: boolean; message: string }> => {
    const parsedPayload = changePasswordZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Invalid input";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        const response = await changePasswordService({
            currentPassword: parsedPayload.data.currentPassword,
            newPassword: parsedPayload.data.newPassword,
        });

        return {
            success: true,
            message: response?.message || "Password changed successfully",
        };
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to change password";
        return {
            success: false,
            message,
        };
    }
};

