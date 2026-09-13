import ProfileContent from "@/components/modules/Profile/ProfileContent";
import { getUserInfo } from "@/services/auth.services";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Profile | Medix Healthcare",
    description: "View and manage your account details, health summaries, and clinical credentials.",
};

const MyProfilePage = async () => {
    // SSR prefetch to eliminate waterfalls
    const userInfo = await getUserInfo();

    return <ProfileContent initialData={userInfo} />;
};

export default MyProfilePage;