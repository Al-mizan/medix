import type { Metadata } from "next";
import LoginForm from "@/components/modules/Auth/LoginForm";

export const metadata: Metadata = {
    title: "Sign In to Your Account",
    description:
        "Sign in to access your Medix patient portal, doctor workspace, or administrative dashboard.",
};

interface LoginParams {
    searchParams: Promise<{ redirect?: string }>;
}

const LoginPage = async ({ searchParams }: LoginParams) => {
    const params = await searchParams;
    const redirectPath = params.redirect;
    return <LoginForm redirectPath={redirectPath} />;
};

export default LoginPage;
