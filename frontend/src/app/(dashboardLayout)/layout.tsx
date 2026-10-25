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
        <div className="relative flex h-screen w-full overflow-hidden">
            {/* Dashboard Sidebar */}
            <DashboardSidebar />

            <div className="relative flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
                {/* DashboardNavbar */}
                <DashboardNavbar />
                {/* Dashboard Content */}
                <main className="relative flex-1 min-h-0 overflow-y-auto bg-muted/10 p-4 md:p-6">
                    <div className="w-full min-w-0">{children}</div>
                </main>
            </div>

            {/* Floating RAG AI Assistant Button (TICK-018) */}
            <AskMedixAIButton />
        </div>
    );
};

export default RootDashboardLayout;

