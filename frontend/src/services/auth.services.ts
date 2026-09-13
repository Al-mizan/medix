"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;

        const cookieParts = [`refreshToken=${refreshToken}`];
        if (sessionToken) {
            cookieParts.push(`better-auth.session_token=${sessionToken}`);
        }

        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieParts.join("; ")
            }
        });

        if (!res.ok) {
            return false;
        }

        const { data } = await res.json();

        const { accessToken, refreshToken: newRefreshToken, token } = data;

        if (accessToken) {
            await setTokenInCookies("accessToken", accessToken);
        }

        if (newRefreshToken) {
            await setTokenInCookies("refreshToken", newRefreshToken);
        }

        if (token) {
            await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds
        }

        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}

export async function getUserInfo() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;

        if (!accessToken) {
            return null;
        }

        const cookieParts = [`accessToken=${accessToken}`];
        if (sessionToken) {
            cookieParts.push(`better-auth.session_token=${sessionToken}`);
        }

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                Cookie: cookieParts.join("; ")
            }
        });

        if (!res.ok) {
            if (res.status === 401) {
                return null;
            }
            console.error("Failed to fetch user info:", res.status, res.statusText);
            return null;
        }

        const { data } = await res.json();

        return data;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}

export async function registerPatientService(payload: {
    name: string;
    email: string;
    password: string;
    contactNumber?: string;
}) {
    const res = await fetch(`${BASE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Registration failed");
    }
    return result;
}

export async function verifyEmailService(payload: { email: string; otp: string }) {
    const res = await fetch(`${BASE_API_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Email verification failed");
    }
    return result;
}

export async function resendOtpService(email: string) {
    const res = await fetch(`${BASE_API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Failed to resend OTP");
    }
    return result;
}

export async function forgotPasswordService(email: string) {
    const res = await fetch(`${BASE_API_URL}/auth/forget-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Failed to send reset code");
    }
    return result;
}

export async function resetPasswordService(payload: {
    email: string;
    otp: string;
    newPassword: string;
}) {
    const res = await fetch(`${BASE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Password reset failed");
    }
    return result;
}

export async function logoutUserService() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;
    const accessToken = cookieStore.get("accessToken")?.value;

    if (sessionToken || accessToken) {
        try {
            await fetch(`${BASE_API_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `better-auth.session_token=${sessionToken || ""}; accessToken=${accessToken || ""}`,
                },
            });
        } catch (error) {
            console.error("Error calling logout endpoint:", error);
        }
    }
}

export async function changePasswordService(payload: {
    currentPassword: string;
    newPassword: string;
}) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken || !sessionToken) {
        throw new Error("Authentication required. Please log in again.");
    }

    const res = await fetch(`${BASE_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Failed to change password");
    }

    const tokenData = result.data;
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

    return result;
}
