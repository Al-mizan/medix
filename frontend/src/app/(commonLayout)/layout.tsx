import Navbar from "@/components/shared/Navbar";
import StickyMobileCTA from "@/components/shared/StickyMobileCTA";
import { getUserInfo } from "@/services/auth.services";

export default async function CommonLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getUserInfo();

    return (
        <div className="relative min-h-screen flex flex-col pb-16 md:pb-0">
            <Navbar user={user} />
            <div className="flex-1">{children}</div>
            <StickyMobileCTA />
        </div>
    );
}

