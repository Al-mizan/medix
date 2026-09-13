import ChangePasswordForm from "@/components/modules/Auth/ChangePasswordForm";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Change Password | Medix Healthcare",
    description: "Update your account password and maintain your security credentials.",
};

const ChangePasswordPage = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Change Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your account security and password credentials
                    </p>
                </div>

                <Link
                    href="/my-profile"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                    <ArrowLeft className="size-4" />
                    Back to Profile
                </Link>
            </div>

            <div className="py-4">
                <ChangePasswordForm />
            </div>
        </div>
    );
};

export default ChangePasswordPage;