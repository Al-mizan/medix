import React from "react";
import { UserInfo } from "@/types/user.types";
import ProfilePatientHealthCard from "./ProfilePatientHealthCard";
import ProfileDoctorDetailsCard from "./ProfileDoctorDetailsCard";
import ProfileAdminScopeCard from "./ProfileAdminScopeCard";

interface ProfileRoleDetailsCardProps {
    user: UserInfo;
}

export default function ProfileRoleDetailsCard({ user }: ProfileRoleDetailsCardProps) {
    if (user.role === "PATIENT") {
        return <ProfilePatientHealthCard patientData={user.patient} />;
    }

    if (user.role === "DOCTOR" && user.doctor) {
        return <ProfileDoctorDetailsCard doctorData={user.doctor} />;
    }

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        return <ProfileAdminScopeCard role={user.role} />;
    }

    return null;
}
