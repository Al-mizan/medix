"use client";

import React from "react";
import { UserInfo } from "@/types/user.types";
import ProfilePersonalInfoCard from "./ProfilePersonalInfoCard";
import ProfileRoleDetailsCard from "./ProfileRoleDetailsCard";
import ProfileSecuritySidebar from "./ProfileSecuritySidebar";

interface ProfileViewProps {
    user: UserInfo;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Personal Information & Role Details (2 cols on md) */}
            <div className="md:col-span-2 space-y-6">
                <ProfilePersonalInfoCard user={user} />
                <ProfileRoleDetailsCard user={user} />
            </div>

            {/* Right Column: Security & Settings */}
            <ProfileSecuritySidebar updatedAt={user.updatedAt} />
        </div>
    );
};

export default ProfileView;
