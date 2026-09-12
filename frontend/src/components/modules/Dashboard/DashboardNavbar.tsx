import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getNavItemsByRole } from "@/lib/navItems";
import { getUserInfo } from "@/services/auth.services";
import { NavSection } from "@/types/dashboard.types";
import DashboardNavbarContent from "./DashboardNavbarContent";

const DashboardNavbar = async () => {
    const userInfo = await getUserInfo();
    const navItems: NavSection[] = userInfo?.role ? getNavItemsByRole(userInfo.role) : [];

    const dashboardHome = userInfo?.role ? getDefaultDashboardRoute(userInfo.role) : "/";
    return (
        <DashboardNavbarContent
            userInfo={userInfo}
            navItems={navItems}
            dashboardHome={dashboardHome}
        />
    );
};

export default DashboardNavbar;
