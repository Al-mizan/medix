"use server";

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { isAxiosError } from "axios";
import { redirect } from "next/navigation";

export const loginAction = async (payload: ILoginPayload, redirectPath?: string): Promise<ILoginResponse | ApiErrorResponse> => {
    const parsedPayload = loginZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError = parsedPayload.error.issues[0].message || "Invalid input";
        return {
            success: false,
            message: firstError,
        }
    }
    try {
        const response = await httpClient.post<ILoginResponse>("/auth/login", parsedPayload.data);

        const { accessToken, refreshToken, token, user } = response.data;
        const { role, needPasswordChange, email } = user;
        await setTokenInCookies("accessToken", accessToken);
        await setTokenInCookies("refreshToken", refreshToken);
        await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds

        if (needPasswordChange) {
            redirect(`/reset-password?email=${encodeURIComponent(email)}`);
        } else {
            const targetPath = redirectPath && isValidRedirectForRole(redirectPath, role as UserRole)
                ? redirectPath
                : getDefaultDashboardRoute(role as UserRole);

            redirect(targetPath);
        }

    } catch (error: unknown) {
        if (error && typeof error === "object" && "digest" in error && typeof (error as { digest: unknown }).digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
            throw error;
        }

        if (isAxiosError(error) && error.response?.data?.message === "Email not verified") {
            redirect(`/verify-email?email=${encodeURIComponent(payload.email)}`);
        }

        let message = "An error occurred";
        if (isAxiosError(error)) {
            message = error.response?.status === 404
                ? `API endpoint not found at ${process.env.NEXT_PUBLIC_API_BASE_URL}`
                : (error.response?.data?.message || error.message);
        } else if (error instanceof Error) {
            message = error.message;
        }

        return {
            success: false,
            message: `Login failed: ${message}`,
        };
    }
}