import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm";

interface VerifyEmailPageProps {
    searchParams: Promise<{ email?: string }>;
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
    const params = await searchParams;
    return <VerifyEmailForm initialEmail={params.email} />;
};

export default VerifyEmailPage;
