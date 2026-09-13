import type { Metadata } from "next";
import RegisterForm from "@/components/modules/Auth/RegisterForm";

export const metadata: Metadata = {
    title: "Create Patient Account",
    description:
        "Join Medix to book consultations with top specialists, track medical reports, and receive digital prescriptions.",
};

const RegisterPage = () => {
    return <RegisterForm />;
};

export default RegisterPage;