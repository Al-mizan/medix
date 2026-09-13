import type { Metadata } from "next";
import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm";

export const metadata: Metadata = {
    title: "Set New Password",
    description: "Update your Medix account security password.",
};

interface ResetPasswordPageProps {
    searchParams: Promise<{ email?: string }>;
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
    const params = await searchParams;
    return <ResetPasswordForm initialEmail={params.email} />;
};

export default ResetPasswordPage;
