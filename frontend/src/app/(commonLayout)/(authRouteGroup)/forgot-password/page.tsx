import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/modules/Auth/ForgotPasswordForm";

export const metadata: Metadata = {
    title: "Recover Password",
    description: "Recover access to your Medix healthcare account securely.",
};

const ForgotPasswordPage = () => {
    return <ForgotPasswordForm />;
};

export default ForgotPasswordPage;
