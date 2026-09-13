import type { Metadata } from "next";
import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm";

export const metadata: Metadata = {
    title: "Verify Email Address",
    description: "Verify your email to complete registration on Medix.",
};

interface VerifyEmailPageProps {
    searchParams: Promise<{ email?: string }>;
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
    const params = await searchParams;
    return <VerifyEmailForm initialEmail={params.email} />;
};

export default VerifyEmailPage;
