import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import AskMedixAIButton from "@/components/modules/AI/AskMedixAIButton";
import React from "react";

export const dynamic = "force-dynamic";

const RootDashboardLayout = async ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Dashboard Sidebar */}
            <DashboardSidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                {/* DashboardNavbar */}
                <DashboardNavbar />
                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
                    <div>{children}</div>
                </main>
            </div>

            {/* Floating RAG AI Assistant Button (TICK-018) */}
            <AskMedixAIButton />
        </div>
    );
};

export default RootDashboardLayout;

